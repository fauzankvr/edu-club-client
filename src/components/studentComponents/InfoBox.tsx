interface infointer {
  right: string;
  topValue: string;
  bottomText: string;
  topText:string
}

const InfoBox = ({  right, topValue, topText, bottomText }:infointer) => {
  return (
    <div
      className={`absolute top-${topValue} right-${right} bg-white shadow-lg p-4 rounded-sm text-center w-44`}
    >
      <h3 className="text-indigo-600 text-3xl font-bold">{topText}</h3>
      <p className="text-gray-700 text-sm">{bottomText}</p>
    </div>
  );
};

export default InfoBox