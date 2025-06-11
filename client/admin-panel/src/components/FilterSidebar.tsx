export const FilterSidebar = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-700">Filters</h2>

      <div>
        <label className="block mb-2 text-sm text-gray-600">Status</label>
        <select className="w-full p-2.5 bg-white border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
          <option>All</option>
          <option>Pending</option>
          <option>Confirmed</option>
          <option>Frozen</option>
        </select>
      </div>

      <div>
        <label className="block mb-2 text-sm text-gray-600">Fraud Risk</label>
        <select className="w-full p-2.5 bg-white border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
          <option>All</option>
          <option>High</option>
          <option>Low</option>
        </select>
      </div>

      <div>
        <label className="block mb-2 text-sm text-gray-600">Amount Range</label>
        <input type="range" min={0} max={1000} className="w-full" />
      </div>
    </div>
  );
};
