/* TeacherManagement.tsx */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@iconify/react";
import Navbar from "@/components/adminComponet/Navbar";
import Sidebar from "@/components/adminComponet/Sidebar";
import adminApi from "@/API/adminApi";
import { Teacher } from "../types/instructor";
import { useEffect, useState } from "react";

/* ---------- helpers ---------- */
const toArray = (field: unknown): string[] => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  try {
    const parsed = JSON.parse(String(field));
    return Array.isArray(parsed) ? parsed : [String(parsed)];
  } catch {
    return [String(field)];
  }
};

const beautifyTeachers = (raw: any[]): Teacher[] =>
  raw.map((t) => ({
    ...t,
    expertise: toArray(t.expertise),
    languages: toArray(t.languages),
    certifications: toArray(t.certifications),
  }));

/* ---------- component ---------- */
const TeacherManagement = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filtered, setFiltered] = useState<Teacher[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<
    "all" | "approved" | "pending" | "blocked"
  >("all");
  const [selected, setSelected] = useState<Teacher | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const PER_PAGE = 8;

  /* --- fetch on mount --- */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await adminApi.getAllTeachers();
        setTeachers(beautifyTeachers(res?.data?.data || []));
      } catch (err) {
        console.error("Failed to fetch teachers", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* --- filtering / searching --- */
  useEffect(() => {
    const q = search.toLowerCase();
    const data = teachers.filter((t) => {
      const matchesSearch =
        t.fullName.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q);
      const matchesStatus =
        status === "all" ||
        (status === "approved" && t.isApproved && !t.isBlocked) ||
        (status === "pending" && !t.isApproved) ||
        (status === "blocked" && t.isBlocked);

      return matchesSearch && matchesStatus;
    });
    setFiltered(data);
    setPage(1); // reset page on new filter
  }, [teachers, search, status]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const rows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  /* --- mutations --- */
  const toggleBlock = async (t: Teacher) => {
    try {
      await adminApi.blockTeacher(t.email);
      setTeachers((prev) =>
        prev.map((p) =>
          p._id === t._id ? { ...p, isBlocked: !p.isBlocked } : p
        )
      );
      if (selected?._id === t._id)
        setSelected({ ...t, isBlocked: !t.isBlocked });
    } catch (err) {
      console.error("block/unblock error", err);
    }
  };

  const approveTeacher = async (t: Teacher) => {
    try {
      await adminApi.approveTeacher(t.email);
      setTeachers((prev) =>
        prev.map((p) => (p._id === t._id ? { ...p, isApproved: true } : p))
      );
      if (selected?._id === t._id) setSelected({ ...t, isApproved: true });
    } catch (err) {
      console.error("approve error", err);
    }
  };

  /* --- helpers for UI --- */
  const badge = (t: Teacher) =>
    t.isBlocked ? (
      <Badge variant="destructive" className="gap-1">
        <Icon icon="mdi:block-helper" className="w-3 h-3" />
        Blocked
      </Badge>
    ) : !t.isApproved ? (
      <Badge variant="secondary" className="gap-1">
        <Icon icon="mdi:clock-outline" className="w-3 h-3" />
        Pending
      </Badge>
    ) : (
      <Badge className="gap-1 bg-green-600">
        <Icon icon="mdi:check-circle" className="w-3 h-3" />
        Approved
      </Badge>
    );

  const count = (key: "all" | "approved" | "pending" | "blocked") =>
    key === "all"
      ? teachers.length
      : key === "approved"
      ? teachers.filter((t) => t.isApproved && !t.isBlocked).length
      : key === "pending"
      ? teachers.filter((t) => !t.isApproved).length
      : teachers.filter((t) => t.isBlocked).length;

  /* ---------- render ---------- */
  if (loading)
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center">
            <Icon
              icon="mdi:loading"
              className="w-12 h-12 animate-spin text-indigo-600"
            />
          </div>
        </div>
      </>
    );

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar />

        <div className="flex-1 p-6 space-y-6">
          {/* ===== Header / stats ===== */}
          <Card>
            <CardContent className="p-6 flex flex-col gap-6 lg:flex-row lg:justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Icon icon="mdi:account-group" className="text-indigo-600" />
                  Teacher Management
                </h1>
                <p className="text-gray-600">
                  Manage instructor applications and accounts
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    k: "all",
                    label: "Total",
                    col: "bg-blue-600",
                    icon: "mdi:account-group",
                  },
                  {
                    k: "approved",
                    label: "Approved",
                    col: "bg-green-600",
                    icon: "mdi:check-circle",
                  },
                  {
                    k: "pending",
                    label: "Pending",
                    col: "bg-yellow-600",
                    icon: "mdi:clock-outline",
                  },
                  {
                    k: "blocked",
                    label: "Blocked",
                    col: "bg-red-600",
                    icon: "mdi:block-helper",
                  },
                ].map((s) => (
                  <div
                    key={s.k}
                    className="rounded-lg border p-3 text-center bg-white"
                  >
                    <div
                      className={`w-8 h-8 ${s.col} rounded-full flex items-center justify-center mx-auto mb-1`}
                    >
                      <Icon icon={s.icon} className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xl font-bold">{count(s.k as "all" | "approved" | "pending" | "blocked")}</div>
                    <div className="text-xs text-gray-600">{s.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ===== search + tabs ===== */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Icon
                    icon="mdi:magnify"
                    className="absolute left-3 top-3 text-gray-400 w-5 h-5"
                  />
                  <Input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Tabs
                  value={status}
                  onValueChange={(v) => setStatus(v as any)}
                  className="w-full lg:w-auto"
                >
                  <TabsList className="grid w-full grid-cols-4">
                    {["all", "approved", "pending", "blocked"].map((tab) => (
                      <TabsTrigger key={tab} value={tab} className="capitalize">
                        {tab}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              <div className="text-sm text-gray-600">
                Showing {rows.length} of {filtered.length} teachers
              </div>
            </CardContent>
          </Card>

          {/* ===== cards grid ===== */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rows.map((t) => (
              <Card
                key={t._id}
                className="border-gray-200 hover:shadow-lg transition-shadow duration-200"
              >
                <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                  {/* avatar */}
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={t.profileImage} alt={t.fullName} />
                    <AvatarFallback className="bg-indigo-100 text-indigo-600 text-sm font-medium">
                      {t.fullName?.[0] || "T"}
                    </AvatarFallback>
                  </Avatar>

                  {/* info */}
                  <div className="space-y-1 w-full">
                    <h3 className="font-semibold text-sm truncate">
                      {t.fullName}
                    </h3>
                    <p className="text-xs text-gray-600 truncate">{t.email}</p>
                    <p className="text-xs text-gray-500">
                      {t.phone || "No phone"}
                    </p>
                    <div className="flex justify-center py-1">{badge(t)}</div>
                  
                  </div>

                  {/* Actions container */}
                  <div className="w-full flex flex-col gap-2">
                    {/* Approve + Block side by side */}
                    <div className="flex gap-2 w-full">
                      {!t.isApproved && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white flex-1 h-8 px-2 text-xs truncate"
                          onClick={() => approveTeacher(t)}
                          style={{ minWidth: 0 }} // To avoid min-width issues in flex
                        >
                          <Icon
                            icon="mdi:check"
                            className="w-3 h-3 mr-1 flex-shrink-0"
                          />
                          Approve
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant={t.isBlocked ? "default" : "destructive"}
                        className={`h-8 px-2 text-xs flex-1 truncate`}
                        onClick={() => toggleBlock(t)}
                        style={{ minWidth: 0 }} // Ensures shrinking if needed
                      >
                        <Icon
                          icon={
                            t.isBlocked
                              ? "mdi:account-check"
                              : "mdi:block-helper"
                          }
                          className="w-3 h-3 mr-1 flex-shrink-0"
                        />
                        {t.isBlocked ? "Unblock" : "Block"}
                      </Button>
                    </div>

                    {/* Full width View button underneath */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-8 px-2 text-xs"
                      onClick={() => {
                        setSelected(t);
                        setOpen(true);
                      }}
                    >
                      <Icon
                        icon="mdi:eye"
                        className="w-3 h-3 mr-1 flex-shrink-0"
                      />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* empty */}
          {rows.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Icon
                  icon="mdi:account-search"
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                />
                <h3 className="text-lg font-semibold">No teachers found</h3>
                <p className="text-gray-600">
                  Try adjusting your search or filter criteria
                </p>
              </CardContent>
            </Card>
          )}

          {/* ===== pagination ===== */}
          {totalPages > 1 && (
            <Card>
              <CardContent className="p-4 flex justify-center items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <Icon icon="mdi:chevron-left" />
                </Button>

                {[...Array(totalPages)].map((_, i) => {
                  const num = i + 1;
                  if (
                    totalPages > 5 &&
                    num !== 1 &&
                    num !== totalPages &&
                    (num < page - 2 || num > page + 2)
                  )
                    return num === 2 || num === totalPages - 1 ? (
                      <span key={num} className="px-1">
                        …
                      </span>
                    ) : null;

                  return (
                    <Button
                      key={num}
                      size="sm"
                      variant={page === num ? "default" : "outline"}
                      onClick={() => setPage(num)}
                    >
                      {num}
                    </Button>
                  );
                })}

                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <Icon icon="mdi:chevron-right" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ===== modal ===== */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={selected.profileImage} />
                    <AvatarFallback className="bg-indigo-100 text-indigo-600">
                      {selected.fullName?.[0] || "T"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold">{selected.fullName}</h2>
                    {badge(selected)}
                  </div>
                </DialogTitle>
              </DialogHeader>

              {/* quick actions */}
              <div className="flex gap-3 p-4 bg-gray-50 rounded-lg mb-6 flex-col sm:flex-row">
                {!selected.isApproved && (
                  <Button
                    className="bg-green-600"
                    onClick={() => approveTeacher(selected)}
                  >
                    <Icon icon="mdi:check" className="mr-1" />
                    Approve
                  </Button>
                )}
                <Button
                  variant={selected.isBlocked ? "default" : "destructive"}
                  onClick={() => toggleBlock(selected)}
                >
                  <Icon
                    icon={
                      selected.isBlocked
                        ? "mdi:account-check"
                        : "mdi:block-helper"
                    }
                    className="mr-1"
                  />
                  {selected.isBlocked ? "Unblock" : "Block"}
                </Button>
              </div>

              {/* tabs */}
              <Tabs defaultValue="personal">
                <TabsList className="grid grid-cols-4 w-full">
                  {["personal", "education", "professional", "contact"].map(
                    (t) => (
                      <TabsTrigger key={t} value={t} className="capitalize">
                        {t}
                      </TabsTrigger>
                    )
                  )}
                </TabsList>

                {/* ---------- PERSONAL ---------- */}
                <TabsContent value="personal">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        <Icon
                          icon="mdi:account"
                          className="text-indigo-600 mr-1"
                        />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">
                            Full Name
                          </label>
                          <p>{selected.fullName}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Email</label>
                          <p>{selected.email}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Phone</label>
                          <p>{selected.phone || "N/A"}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">
                            Date of Birth
                          </label>
                          <p>
                            {selected.dateOfBirth
                              ? new Date(
                                  selected.dateOfBirth
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>

                      {selected.Biography && (
                        <div>
                          <label className="text-sm text-gray-600">
                            Biography
                          </label>
                          <p>{selected.Biography}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ---------- EDUCATION ---------- */}
                <TabsContent value="education">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        <Icon
                          icon="mdi:school"
                          className="text-indigo-600 mr-1"
                        />
                        Educational Background
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">
                            Qualification
                          </label>
                          <p>{selected.eduQulification || "N/A"}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">
                            Experience
                          </label>
                          <p>{selected.experience ?? 0} years</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">
                            Teaching Exp.
                          </label>
                          <p>{selected.teachingExperience ?? 0} years</p>
                        </div>
                      </div>

                      {!!selected?.expertise?.length && (
                        <section>
                          <label className="text-sm text-gray-600">
                            Areas of Expertise
                          </label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selected.expertise.map((ex) => (
                              <Badge key={ex}>{ex}</Badge>
                            ))}
                          </div>
                        </section>
                      )}

                      {!!selected?.languages?.length && (
                        <section>
                          <label className="text-sm text-gray-600">
                            Languages
                          </label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selected.languages.map((l) => (
                              <Badge key={l} variant="outline">
                                {l}
                              </Badge>
                            ))}
                          </div>
                        </section>
                      )}

                      {!!selected?.certifications?.length && (
                        <section>
                          <label className="text-sm text-gray-600">
                            Certifications
                          </label>
                          <div className="grid grid-cols-1 gap-2 mt-2">
                            {selected.certifications.map((cert, index) => {
                              const isCloudinaryLink =
                                cert.includes("cloudinary.com");

                              if (isCloudinaryLink) {
                                // Extract short name from URL
                                const shortName =
                                  cert
                                    .split("/")
                                    .pop()
                                    ?.split(".")[0]
                                    ?.replace(/^\d+-/, "") || "Certificate";

                                return (
                                  <a
                                    key={index}
                                    href={cert}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                                  >
                                    <Icon
                                      icon="mdi:file-pdf"
                                      className="text-red-600 w-4 h-4"
                                    />
                                    <span className="text-sm text-blue-700 font-medium truncate flex-1">
                                      {shortName}
                                    </span>
                                    <Icon
                                      icon="mdi:external-link"
                                      className="text-blue-600 w-3 h-3"
                                    />
                                  </a>
                                );
                              } else {
                                return (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                                  >
                                    <Icon
                                      icon="mdi:certificate"
                                      className="text-green-600 w-4 h-4"
                                    />
                                    <span className="text-sm">{cert}</span>
                                  </div>
                                );
                              }
                            })}
                          </div>
                        </section>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ---------- PROFESSIONAL ---------- */}
                <TabsContent value="professional">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        <Icon
                          icon="mdi:briefcase"
                          className="text-indigo-600 mr-1"
                        />
                        Professional Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">
                            Current Position
                          </label>
                          <p>{selected.currentPosition || "N/A"}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">
                            Workplace
                          </label>
                          <p>{selected.workPlace || "N/A"}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">
                            LinkedIn
                          </label>
                          {selected.linkedInProfile ? (
                            <a
                              href={selected.linkedInProfile}
                              target="_blank"
                              className="text-blue-600 underline"
                            >
                              View
                            </a>
                          ) : (
                            <p>N/A</p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">
                            Website
                          </label>
                          {selected.website ? (
                            <a
                              href={selected.website}
                              target="_blank"
                              className="text-blue-600 underline"
                            >
                              Visit
                            </a>
                          ) : (
                            <p>N/A</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ---------- CONTACT ---------- */}
                <TabsContent value="contact">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        <Icon
                          icon="mdi:map-marker"
                          className="text-indigo-600 mr-1"
                        />
                        Contact & Location
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-600">
                          PayPal Email
                        </label>
                        <p>{selected.paypalEmail || "N/A"}</p>
                      </div>

                      {selected.address && (
                        <div>
                          <label className="text-sm text-gray-600">
                            Address
                          </label>
                          <p className="mt-1">
                            {[
                              selected.address.street,
                              selected.address.city,
                              selected.address.state,
                              selected.address.zipCode,
                              selected.address.country,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        </div>
                      )}

                      {selected.socialMedia && (
                        <div>
                          <label className="text-sm text-gray-600">
                            Social Media
                          </label>
                          <div className="flex gap-3 mt-2">
                            {[
                              {
                                k: "twitter",
                                icon: "mdi:twitter",
                                col: "text-blue-400",
                              },
                              {
                                k: "facebook",
                                icon: "mdi:facebook",
                                col: "text-blue-600",
                              },
                              {
                                k: "instagram",
                                icon: "mdi:instagram",
                                col: "text-pink-600",
                              },
                              {
                                k: "youtube",
                                icon: "mdi:youtube",
                                col: "text-red-600",
                              },
                            ].map(
                              ({ k, icon, col }) =>
                                selected?.socialMedia?.[k as keyof typeof selected.socialMedia] && (
                                  <a
                                    key={k}
                                    href={
                                      selected.socialMedia[
                                        k as keyof typeof selected.socialMedia
                                      ]!
                                    }
                                    target="_blank"
                                    className={`${col} hover:opacity-80`}
                                  >
                                    <Icon icon={icon} className="w-6 h-6" />
                                  </a>
                                )
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TeacherManagement;
