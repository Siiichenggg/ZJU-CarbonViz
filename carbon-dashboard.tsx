import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, Cell } from 'recharts';

// Data generation functions
const generateHistoricalData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const data = [];
  
  // Simulate seasonal variations
  for (let i = 0; i < 12; i++) {
    const isSummer = i >= 5 && i <= 7;
    const isWinter = i <= 1 || i >= 10;
    
    data.push({
      month: months[i],
      electricity: Math.round(150000 + 50000 * Math.sin(i/2) + (isSummer ? 80000 : 0) + Math.random() * 20000),
      water: Math.round(80000 + 20000 * Math.cos(i/3) + Math.random() * 5000),
      gas: Math.round(30000 + 40000 * (isWinter ? 1.5 : 0.5) + Math.random() * 5000),
    });
  }
  
  // Calculate carbon emissions
  data.forEach(item => {
    // Coefficients: Electricity 0.785 kg CO2/kWh, Water 0.25 kg CO2/t, Natural Gas 2.1 kg CO2/m3
    item.carbonElectricity = Math.round(item.electricity * 0.785 / 1000);
    item.carbonWater = Math.round(item.water * 0.25 / 1000);
    item.carbonGas = Math.round(item.gas * 2.1 / 1000);
    item.totalCarbon = item.carbonElectricity + item.carbonWater + item.carbonGas;
  });
  
  return data;
};

// Generate prediction data
const generatePredictionData = (historicalData) => {
  const lastMonth = historicalData[historicalData.length - 1];
  const predictions = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (let i = 0; i < 12; i++) {
    const monthIndex = (historicalData.length + i) % 12;
    const isSummer = monthIndex >= 5 && monthIndex <= 7;
    const isWinter = monthIndex <= 1 || monthIndex >= 10;
    
    // Predict based on seasonality and slight upward trend
    const trendFactor = 1 + (i * 0.005); // 0.5% increase each month
    
    predictions.push({
      month: months[monthIndex],
      electricity: Math.round((lastMonth.electricity + 50000 * Math.sin(monthIndex/2) + (isSummer ? 80000 : 0)) * trendFactor),
      water: Math.round((lastMonth.water + 20000 * Math.cos(monthIndex/3)) * trendFactor),
      gas: Math.round((lastMonth.gas + 40000 * (isWinter ? 1.5 : 0.5)) * trendFactor),
      isPrediction: true,
    });
  }
  
  // Calculate carbon emissions
  predictions.forEach(item => {
    item.carbonElectricity = Math.round(item.electricity * 0.785 / 1000);
    item.carbonWater = Math.round(item.water * 0.25 / 1000);
    item.carbonGas = Math.round(item.gas * 2.1 / 1000);
    item.totalCarbon = item.carbonElectricity + item.carbonWater + item.carbonGas;
  });
  
  return predictions;
};

// Calculate yearly data
const calculateYearlyData = (data) => {
  const yearlyData = {
    electricity: data.reduce((sum, item) => sum + item.electricity, 0),
    water: data.reduce((sum, item) => sum + item.water, 0),
    gas: data.reduce((sum, item) => sum + item.gas, 0),
    totalCarbon: data.reduce((sum, item) => sum + item.totalCarbon, 0),
  };
  
  return yearlyData;
};

// Calculate carbon emission sources
const calculateCarbonSources = (data) => {
  const totalElectricity = data.reduce((sum, item) => sum + item.carbonElectricity, 0);
  const totalWater = data.reduce((sum, item) => sum + item.carbonWater, 0);
  const totalGas = data.reduce((sum, item) => sum + item.carbonGas, 0);
  const total = totalElectricity + totalWater + totalGas;
  
  return [
    { name: 'Electricity', value: totalElectricity, percentage: Math.round(totalElectricity / total * 1000) / 10 },
    { name: 'Water', value: totalWater, percentage: Math.round(totalWater / total * 1000) / 10 },
    { name: 'Natural Gas', value: totalGas, percentage: Math.round(totalGas / total * 1000) / 10 }
  ];
};

// Generate building data
const generateBuildingData = () => {
  const buildings = [
    'Library', 'Administration Building', 'Teaching Building A', 'Teaching Building B', 'Student Dormitory Area 1', 
    'Student Dormitory Area 2', 'Cafeteria', 'Laboratory A', 'Laboratory B', 'Gymnasium'
  ];
  
  return buildings.map(building => {
    // Generate different ranges of random data for different buildings
    const multiplier = building.includes('Laboratory') ? 1.8 : 
                      building.includes('Cafeteria') ? 1.5 :
                      building.includes('Teaching') ? 1.3 :
                      building.includes('Dormitory') ? 1.2 : 1;
    
    return {
      name: building,
      electricity: Math.round((70000 + Math.random() * 50000) * multiplier),
      water: Math.round((40000 + Math.random() * 20000) * multiplier),
      gas: building.includes('Cafeteria') ? Math.round(20000 + Math.random() * 10000) : Math.round(5000 + Math.random() * 5000),
    };
  }).map(item => {
    // Calculate carbon emissions
    item.carbonElectricity = Math.round(item.electricity * 0.785 / 1000);
    item.carbonWater = Math.round(item.water * 0.25 / 1000);
    item.carbonGas = Math.round(item.gas * 2.1 / 1000);
    item.totalCarbon = item.carbonElectricity + item.carbonWater + item.carbonGas;
    return item;
  }).sort((a, b) => b.totalCarbon - a.totalCarbon); // Sort by carbon emission
};

// Main application component
const CarbonEmissionSystem = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [historicalData, setHistoricalData] = useState([]);
  const [predictionData, setPredictionData] = useState([]);
  const [yearlyData, setYearlyData] = useState({});
  const [carbonSources, setCarbonSources] = useState([]);
  const [buildingData, setBuildingData] = useState([]);
  const [showPrediction, setShowPrediction] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      const historical = generateHistoricalData();
      const predictions = generatePredictionData(historical);
      const yearly = calculateYearlyData(historical);
      const sources = calculateCarbonSources(historical);
      const buildings = generateBuildingData();
      
      setHistoricalData(historical);
      setPredictionData(predictions);
      setYearlyData(yearly);
      setCarbonSources(sources);
      setBuildingData(buildings);
      setLoading(false);
    }, 1000);
  }, []);
  
  // Color settings
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const BUILDING_COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658'];
  
  // Combine historical and prediction data
  const combinedData = showPrediction 
    ? [...historicalData, ...predictionData.slice(0, 6)] 
    : historicalData;
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation bar */}
      <nav className="bg-green-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Zhejiang University Haining Campus · Carbon Emission Visualization System</h1>
          </div>
          <div className="flex space-x-4">
            <button 
              className={`px-3 py-1 rounded ${activeTab === 'overview' ? 'bg-green-900' : 'hover:bg-green-600'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`px-3 py-1 rounded ${activeTab === 'electricity' ? 'bg-green-900' : 'hover:bg-green-600'}`}
              onClick={() => setActiveTab('electricity')}
            >
              Electricity
            </button>
            <button 
              className={`px-3 py-1 rounded ${activeTab === 'water' ? 'bg-green-900' : 'hover:bg-green-600'}`}
              onClick={() => setActiveTab('water')}
            >
              Water
            </button>
            <button 
              className={`px-3 py-1 rounded ${activeTab === 'gas' ? 'bg-green-900' : 'hover:bg-green-600'}`}
              onClick={() => setActiveTab('gas')}
            >
              Natural Gas
            </button>
            <button 
              className={`px-3 py-1 rounded ${activeTab === 'carbon' ? 'bg-green-900' : 'hover:bg-green-600'}`}
              onClick={() => setActiveTab('carbon')}
            >
              Carbon Emissions
            </button>
            <button 
              className={`px-3 py-1 rounded ${activeTab === 'buildings' ? 'bg-green-900' : 'hover:bg-green-600'}`}
              onClick={() => setActiveTab('buildings')}
            >
              Buildings
            </button>
          </div>
        </div>
      </nav>
      
      {/* Content area */}
      <div className="container mx-auto px-4 py-6">
        {/* Overview page */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Zhejiang University Haining Campus - Carbon Emission Overview</h2>
                <div className="flex items-center">
                  <button 
                    className={`px-4 py-2 rounded mr-2 ${showPrediction ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setShowPrediction(!showPrediction)}
                  >
                    {showPrediction ? 'Hide Prediction' : 'Show Prediction'}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">Annual Electricity Consumption</h3>
                  <p className="text-3xl font-bold text-blue-600">{Math.round(yearlyData.electricity / 10000).toLocaleString()} 10K kWh</p>
                  <p className="text-sm text-blue-500 mt-1">Carbon Emissions: {Math.round(yearlyData.electricity * 0.785 / 1000).toLocaleString()} tons</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-green-800 mb-2">Annual Water Consumption</h3>
                  <p className="text-3xl font-bold text-green-600">{Math.round(yearlyData.water / 10000).toLocaleString()} 10K tons</p>
                  <p className="text-sm text-green-500 mt-1">Carbon Emissions: {Math.round(yearlyData.water * 0.25 / 1000).toLocaleString()} tons</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-yellow-800 mb-2">Annual Natural Gas Consumption</h3>
                  <p className="text-3xl font-bold text-yellow-600">{Math.round(yearlyData.gas / 10000).toLocaleString()} 10K m³</p>
                  <p className="text-sm text-yellow-500 mt-1">Carbon Emissions: {Math.round(yearlyData.gas * 2.1 / 1000).toLocaleString()} tons</p>
                </div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-medium text-red-800 mb-2">Total Carbon Emissions</h3>
                <p className="text-3xl font-bold text-red-600">{Math.round(yearlyData.totalCarbon).toLocaleString()} tons CO₂ equivalent</p>
                <p className="text-sm text-red-500 mt-1">Equivalent to planting {Math.round(yearlyData.totalCarbon * 16.5).toLocaleString()} trees to offset</p>
              </div>
              
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Monthly Carbon Emission Trends</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={combinedData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="totalCarbon" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF5252" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#FF5252" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value.toLocaleString()} tons`} />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="totalCarbon" 
                        name="Total Carbon Emissions" 
                        stroke="#FF5252" 
                        fillOpacity={1} 
                        fill="url(#totalCarbon)" 
                        strokeWidth={2}
                        dot={{ stroke: '#FF5252', strokeWidth: 2, r: 4, fill: 'white' }}
                        activeDot={{ r: 6 }}
                      />
                      {showPrediction && (
                        <Area 
                          type="monotone" 
                          dataKey="totalCarbon" 
                          name="Predicted Carbon Emissions" 
                          stroke="#FF5252" 
                          fillOpacity={1} 
                          fill="url(#totalCarbon)" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          data={predictionData.slice(0, 6)}
                          dot={{ stroke: '#FF5252', strokeWidth: 2, r: 4, fill: 'white' }}
                          activeDot={{ r: 6 }}
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Carbon Emission Sources Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={carbonSources}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percentage }) => `${name}: ${percentage}%`}
                        >
                          {carbonSources.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value.toLocaleString()} tons`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Building Carbon Emission Ranking</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={buildingData.slice(0, 5)}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={80} />
                        <Tooltip formatter={(value) => `${value.toLocaleString()} tons`} />
                        <Legend />
                        <Bar dataKey="totalCarbon" name="Carbon Emissions" fill="#8884d8">
                          {buildingData.slice(0, 5).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={BUILDING_COLORS[index % BUILDING_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Electricity analysis page */}
        {activeTab === 'electricity' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Electricity Consumption Analysis</h2>
                <div className="flex items-center">
                  <button 
                    className={`px-4 py-2 rounded mr-2 ${showPrediction ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setShowPrediction(!showPrediction)}
                  >
                    {showPrediction ? 'Hide Prediction' : 'Show Prediction'}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">Annual Electricity Consumption</h3>
                  <p className="text-3xl font-bold text-blue-600">{Math.round(yearlyData.electricity / 10000).toLocaleString()} 10K kWh</p>
                  <p className="text-sm text-blue-500 mt-1">Year-on-year increase: 4.2%</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">Daily Max Electricity Consumption</h3>
                  <p className="text-3xl font-bold text-blue-600">{Math.round(Math.max(...historicalData.map(item => item.electricity)) / 30).toLocaleString()} kWh</p>
                  <p className="text-sm text-blue-500 mt-1">Peak in July</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">Carbon Emissions Generated</h3>
                  <p className="text-3xl font-bold text-blue-600">{Math.round(yearlyData.electricity * 0.785 / 1000).toLocaleString()} tons</p>
                  <p className="text-sm text-blue-500 mt-1">Accounts for {Math.round(yearlyData.electricity * 0.785 / 10 / yearlyData.totalCarbon).toLocaleString()}% of total emissions</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Monthly Electricity Consumption Trends</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={combinedData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="electricity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value.toLocaleString()} kWh`} />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="electricity" 
                        name="Electricity Consumption" 
                        stroke="#3b82f6" 
                        fillOpacity={1} 
                        fill="url(#electricity)" 
                        strokeWidth={2}
                        dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4, fill: 'white' }}
                        activeDot={{ r: 6 }}
                      />
                      {showPrediction && (
                        <Area 
                          type="monotone" 
                          dataKey="electricity" 
                          name="Predicted Electricity Consumption" 
                          stroke="#3b82f6" 
                          fillOpacity={1} 
                          fill="url(#electricity)" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          data={predictionData.slice(0, 6)}
                          dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4, fill: 'white' }}
                          activeDot={{ r: 6 }}
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Electricity Consumption vs Carbon Emissions</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line 
                          yAxisId="left" 
                          type="monotone" 
                          dataKey="electricity" 
                          name="Electricity Consumption (kWh)" 
                          stroke="#3b82f6" 
                          activeDot={{ r: 8 }} 
                        />
                        <Line 
                          yAxisId="right" 
                          type="monotone" 
                          dataKey="carbonElectricity" 
                          name="Carbon Emissions (tons)" 
                          stroke="#ef4444" 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Building Electricity Consumption Ranking</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={buildingData.slice(0, 5)}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={80} />
                        <Tooltip formatter={(value) => `${value.toLocaleString()} kWh`} />
                        <Legend />
                        <Bar dataKey="electricity" name="Electricity Consumption" fill="#3b82f6">
                          {buildingData.slice(0, 5).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={BUILDING_COLORS[index % BUILDING_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Water analysis page */}
        {activeTab === 'water' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Water Consumption Analysis</h2>
                <div className="flex items-center">
                  <button 
                    className={`px-4 py-2 rounded mr-2 ${showPrediction ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setShowPrediction(!showPrediction)}
                  >
                    {showPrediction ? 'Hide Prediction' : 'Show Prediction'}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-green-800 mb-2">Annual Water Consumption</h3>
                  <p className="text-3xl font-bold text-green-600">{Math.round(yearlyData.water / 10000).toLocaleString()} 10K tons</p>
                  <p className="text-sm text-green-500 mt-1">Year-on-year decrease: 1.8%</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-green-800 mb-2">Daily Max Water Consumption</h3>
                  <p className="text-3xl font-bold text-green-600">{Math.round(Math.max(...historicalData.map(item => item.water)) / 30).toLocaleString()} tons</p>
                  <p className="text-sm text-green-500 mt-1">Peak in April</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-green-800 mb-2">Carbon Emissions Generated</h3>
                  <p className="text-3xl font-bold text-green-600">{Math.round(yearlyData.water * 0.25 / 1000).toLocaleString()} tons</p>
                  <p className="text-sm text-green-500 mt-1">Accounts for {Math.round(yearlyData.water * 0.25 / 10 / yearlyData.totalCarbon).toLocaleString()}% of total emissions</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Monthly Water Consumption Trends</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={combinedData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value.toLocaleString()} tons`} />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="water" 
                        name="Water Consumption" 
                        stroke="#10b981" 
                        fillOpacity={1} 
                        fill="url(#water)" 
                        strokeWidth={2}
                        dot={{ stroke: '#10b981', strokeWidth: 2, r: 4, fill: 'white' }}
                        activeDot={{ r: 6 }}
                      />
                      {showPrediction && (
                        <Area 
                          type="monotone" 
                          dataKey="water" 
                          name="Predicted Water Consumption" 
                          stroke="#10b981" 
                          fillOpacity={1} 
                          fill="url(#water)" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          data={predictionData.slice(0, 6)}
                          dot={{ stroke: '#10b981', strokeWidth: 2, r: 4, fill: 'white' }}
                          activeDot={{ r: 6 }}
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Water Consumption vs Carbon Emissions</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line 
                          yAxisId="left" 
                          type="monotone" 
                          dataKey="water" 
                          name="Water Consumption (tons)" 
                          stroke="#10b981" 
                          activeDot={{ r: 8 }} 
                        />
                        <Line 
                          yAxisId="right" 
                          type="monotone" 
                          dataKey="carbonWater" 
                          name="Carbon Emissions (tons)" 
                          stroke="#ef4444" 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Building Water Consumption Ranking</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={buildingData.slice(0, 5)}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={80} />
                        <Tooltip formatter={(value) => `${value.toLocaleString()} tons`} />
                        <Legend />
                        <Bar dataKey="water" name="Water Consumption" fill="#10b981">
                          {buildingData.slice(0, 5).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={BUILDING_COLORS[index % BUILDING_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Natural gas analysis page */}
        {activeTab === 'gas' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Natural Gas Consumption Analysis</h2>
                <div className="flex items-center">
                  <button 
                    className={`px-4 py-2 rounded mr-2 ${showPrediction ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setShowPrediction(!showPrediction)}
                  >
                    {showPrediction ? 'Hide Prediction' : 'Show Prediction'}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-yellow-800 mb-2">Annual Natural Gas Consumption</h3>
                  <p className="text-3xl font-bold text-yellow-600">{Math.round(yearlyData.gas / 10000).toLocaleString()} 10K m³</p>
                  <p className="text-sm text-yellow-500 mt-1">Year-on-year increase: 2.5%</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-yellow-800 mb-2">Daily Max Natural Gas Consumption</h3>
                  <p className="text-3xl font-bold text-yellow-600">{Math.round(Math.max(...historicalData.map(item => item.gas)) / 30).toLocaleString()} m³</p>
                  <p className="text-sm text-yellow-500 mt-1">Peak in January</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-yellow-800 mb-2">Carbon Emissions Generated</h3>
                  <p className="text-3xl font-bold text-yellow-600">{Math.round(yearlyData.gas * 2.1 / 1000).toLocaleString()} tons</p>
                  <p className="text-sm text-yellow-500 mt-1">Accounts for {Math.round(yearlyData.gas * 2.1 / 10 / yearlyData.totalCarbon).toLocaleString()}% of total emissions</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Monthly Natural Gas Consumption Trends</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={combinedData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="gas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value.toLocaleString()} m³`} />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="gas" 
                        name="Natural Gas Consumption" 
                        stroke="#f59e0b" 
                        fillOpacity={1} 
                        fill="url(#gas)" 
                        strokeWidth={2}
                        dot={{ stroke: '#f59e0b', strokeWidth: 2, r: 4, fill: 'white' }}
                        activeDot={{ r: 6 }}
                      />
                      {showPrediction && (
                        <Area 
                          type="monotone" 
                          dataKey="gas" 
                          name="Predicted Natural Gas Consumption" 
                          stroke="#f59e0b" 
                          fillOpacity={1} 
                          fill="url(#gas)" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          data={predictionData.slice(0, 6)}
                          dot={{ stroke: '#f59e0b', strokeWidth: 2, r: 4, fill: 'white' }}
                          activeDot={{ r: 6 }}
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Natural Gas Consumption vs Carbon Emissions</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line 
                          yAxisId="left" 
                          type="monotone" 
                          dataKey="gas" 
                          name="Natural Gas Consumption (m³)" 
                          stroke="#f59e0b" 
                          activeDot={{ r: 8 }} 
                        />
                        <Line 
                          yAxisId="right" 
                          type="monotone" 
                          dataKey="carbonGas" 
                          name="Carbon Emissions (tons)" 
                          stroke="#ef4444" 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Building Natural Gas Consumption Ranking</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={buildingData.slice(0, 5)}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={80} />
                        <Tooltip formatter={(value) => `${value.toLocaleString()} m³`} />
                        <Legend />
                        <Bar dataKey="gas" name="Natural Gas Consumption" fill="#f59e0b">
                          {buildingData.slice(0, 5).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={BUILDING_COLORS[index % BUILDING_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Carbon emissions page */}
        {activeTab === 'carbon' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Detailed Carbon Emission Analysis</h2>
                <div className="flex items-center">
                  <button 
                    className={`px-4 py-2 rounded mr-2 ${showPrediction ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setShowPrediction(!showPrediction)}
                  >
                    {showPrediction ? 'Hide Prediction' : 'Show Prediction'}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-red-800 mb-2">Total Carbon Emissions</h3>
                  <p className="text-3xl font-bold text-red-600">{Math.round(yearlyData.totalCarbon).toLocaleString()} tons</p>
                  <p className="text-sm text-red-500 mt-1">Year-on-year increase: 3.2%</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-red-800 mb-2">Per Capita Carbon Emissions</h3>
                  <p className="text-3xl font-bold text-red-600">{Math.round(yearlyData.totalCarbon / 8500).toLocaleString()} tons/person</p>
                  <p className="text-sm text-red-500 mt-1">Based on campus population of 8,500</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-red-800 mb-2">Carbon Neutrality Progress</h3>
                  <p className="text-3xl font-bold text-red-600">-{Math.round(yearlyData.totalCarbon).toLocaleString()} tons</p>
                  <p className="text-sm text-red-500 mt-1">Distance to carbon neutrality goal</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Monthly Carbon Emission Breakdown</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={combinedData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      stackOffset="sign"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value.toLocaleString()} tons`} />
                      <Legend />
                      <Bar 
                        dataKey="carbonElectricity" 
                        name="Electricity Carbon Emissions" 
                        stackId="a" 
                        fill="#3b82f6" 
                      />
                      <Bar 
                        dataKey="carbonWater" 
                        name="Water Carbon Emissions" 
                        stackId="a" 
                        fill="#10b981" 
                      />
                      <Bar 
                        dataKey="carbonGas" 
                        name="Natural Gas Carbon Emissions" 
                        stackId="a" 
                        fill="#f59e0b" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Carbon Emission Sources Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={carbonSources}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percentage }) => `${name}: ${percentage}%`}
                        >
                          {carbonSources.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value.toLocaleString()} tons`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Carbon Emission Trend Prediction</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[...historicalData, ...predictionData.slice(0, 6)]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value.toLocaleString()} tons`} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="totalCarbon" 
                          name="Historical Carbon Emissions" 
                          stroke="#ef4444" 
                          activeDot={{ r: 8 }} 
                          data={historicalData}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="totalCarbon" 
                          name="Predicted Carbon Emissions" 
                          stroke="#ef4444" 
                          strokeDasharray="5 5"
                          data={predictionData.slice(0, 6)}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Carbon Reduction Potential Analysis</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="mb-4">Based on current consumption data analysis, the following measures can effectively reduce carbon emissions:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Optimize air conditioning usage time and temperature settings, can reduce electricity consumption by approximately <span className="font-semibold text-blue-600">15%</span></li>
                    <li>Replace with energy-efficient lighting equipment, can reduce electricity consumption by approximately <span className="font-semibold text-blue-600">8%</span></li>
                    <li>Install water recycling systems, can reduce water consumption by approximately <span className="font-semibold text-green-600">20%</span></li>
                    <li>Improve building insulation, can reduce winter heating natural gas consumption by approximately <span className="font-semibold text-yellow-600">12%</span></li>
                    <li>Install campus solar panels, can offset electricity carbon emissions by approximately <span className="font-semibold text-red-600">25%</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Buildings analysis page */}
        {activeTab === 'buildings' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Building Energy Consumption and Carbon Emission Analysis</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-left">Building Name</th>
                      <th className="py-3 px-4 text-right">Electricity (kWh)</th>
                      <th className="py-3 px-4 text-right">Water (tons)</th>
                      <th className="py-3 px-4 text-right">Natural Gas (m³)</th>
                      <th className="py-3 px-4 text-right">Carbon Emissions (tons)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {buildingData.map((building, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-3 px-4">{building.name}</td>
                        <td className="py-3 px-4 text-right">{building.electricity.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">{building.water.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">{building.gas.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-semibold">{building.totalCarbon.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Building Carbon Emission Comparison</h3>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={buildingData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value.toLocaleString()} tons`} />
                      <Legend />
                      <Bar dataKey="carbonElectricity" name="Electricity Carbon Emissions" stackId="a" fill="#3b82f6" />
                      <Bar dataKey="carbonWater" name="Water Carbon Emissions" stackId="a" fill="#10b981" />
                      <Bar dataKey="carbonGas" name="Natural Gas Carbon Emissions" stackId="a" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Energy Efficiency Rating Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Grade A (Excellent)', value: 2 },
                            { name: 'Grade B (Good)', value: 3 },
                            { name: 'Grade C (Average)', value: 4 },
                            { name: 'Grade D (Poor)', value: 1 }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, value, percent }) => `${name}: ${value} buildings (${(percent * 100).toFixed(0)}%)`}
                        >
                          <Cell fill="#22c55e" />
                          <Cell fill="#3b82f6" />
                          <Cell fill="#f59e0b" />
                          <Cell fill="#ef4444" />
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Building Usage vs Carbon Emissions</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { type: 'Teaching Buildings', carbon: Math.round((buildingData.find(b => b.name === 'Teaching Building A').totalCarbon + buildingData.find(b => b.name === 'Teaching Building B').totalCarbon) / 2) },
                          { type: 'Laboratories', carbon: Math.round((buildingData.find(b => b.name === 'Laboratory A').totalCarbon + buildingData.find(b => b.name === 'Laboratory B').totalCarbon) / 2) },
                          { type: 'Dormitories', carbon: Math.round((buildingData.find(b => b.name === 'Student Dormitory Area 1').totalCarbon + buildingData.find(b => b.name === 'Student Dormitory Area 2').totalCarbon) / 2) },
                          { type: 'Administration', carbon: buildingData.find(b => b.name === 'Administration Building').totalCarbon },
                          { type: 'Dining Facilities', carbon: buildingData.find(b => b.name === 'Cafeteria').totalCarbon }
                        ]}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="type" type="category" width={80} />
                        <Tooltip formatter={(value) => `${value.toLocaleString()} tons`} />
                        <Legend />
                        <Bar dataKey="carbon" name="Average Carbon Emissions" fill="#8884d8">
                          <Cell fill="#3b82f6" />
                          <Cell fill="#8884d8" />
                          <Cell fill="#10b981" />
                          <Cell fill="#f59e0b" />
                          <Cell fill="#ef4444" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Building Energy Efficiency Improvement Recommendations</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="mb-4">Based on building energy consumption and carbon emission data analysis, the following key buildings are recommended for energy efficiency improvements:</p>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="py-2 px-4 border text-left">Building Name</th>
                          <th className="py-2 px-4 border text-left">Recommended Measures</th>
                          <th className="py-2 px-4 border text-right">Estimated Carbon Reduction</th>
                          <th className="py-2 px-4 border text-right">ROI Period</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="py-2 px-4 border">{buildingData[0].name}</td>
                          <td className="py-2 px-4 border">Upgrade energy management system, replace with efficient lighting</td>
                          <td className="py-2 px-4 border text-right">{Math.round(buildingData[0].totalCarbon * 0.18).toLocaleString()} tons/year</td>
                          <td className="py-2 px-4 border text-right">3.5 years</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 border">{buildingData[1].name}</td>
                          <td className="py-2 px-4 border">Install smart electricity systems, optimize water recycling</td>
                          <td className="py-2 px-4 border text-right">{Math.round(buildingData[1].totalCarbon * 0.15).toLocaleString()} tons/year</td>
                          <td className="py-2 px-4 border text-right">4.2 years</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 border">{buildingData[2].name}</td>
                          <td className="py-2 px-4 border">Improve building insulation, install solar water heating system</td>
                          <td className="py-2 px-4 border text-right">{Math.round(buildingData[2].totalCarbon * 0.22).toLocaleString()} tons/year</td>
                          <td className="py-2 px-4 border text-right">2.8 years</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>Zhejiang University Haining Campus Carbon Emission Visualization System © 2025</p>
          <p className="text-gray-400 text-sm mt-1">Data Source: Campus Energy Management Center | Update Frequency: Daily</p>
        </div>
      </footer>
    </div>
  );
};

export default CarbonEmissionSystem;
