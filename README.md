# ZJU-CarbonViz

## Zhejiang University Haining Campus Carbon Emission Visualization System

ZJU-CarbonViz is a comprehensive web application designed to visualize and monitor carbon emissions, electricity consumption, water usage, and natural gas consumption at the Zhejiang University Haining Campus. This dashboard serves as both a monitoring tool and a decision support system for campus sustainability initiatives.


## Features

- **Real-time Monitoring**: Track electricity, water, and natural gas consumption data across the campus
- **Carbon Emission Calculation**: Automatic conversion of resource consumption to carbon emissions
- **Multi-dimensional Analysis**: View data by resource type, building, time period, and more
- **Predictive Analytics**: View forecasts of future consumption and emissions based on historical data
- **Building-specific Insights**: Analyze the performance of individual campus buildings
- **Energy Efficiency Recommendations**: Receive data-driven suggestions for reducing emissions
- **Responsive Design**: Access the dashboard from any device with a consistent user experience

## Technologies Used

- **React.js**: Frontend framework for building the user interface
- **Recharts**: Responsive charting library for data visualization
- **Tailwind CSS**: Utility-first CSS framework for styling
- **JavaScript (ES6+)**: Programming language used for application logic

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ZJU-CarbonViz.git
   cd ZJU-CarbonViz
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the dashboard in your browser.

## Usage

The dashboard is organized into several key sections:

1. **Overview**: General summary of carbon emissions and resource consumption
2. **Electricity Analysis**: Detailed analysis of electricity usage and related emissions
3. **Water Analysis**: Water consumption patterns and conservation opportunities
4. **Natural Gas Analysis**: Natural gas usage and seasonal trends
5. **Carbon Emissions**: Comprehensive analysis of carbon footprint
6. **Buildings**: Building-by-building breakdown of resource consumption

Use the navigation tabs at the top to switch between different views, and the "Show Prediction" button to toggle future consumption forecasts.

## Data Integration

The system currently uses simulated data to demonstrate functionality. To integrate with real-world data:

1. Replace the data generation functions in the code with API calls to your data source
2. Update the data transformation logic as needed
3. Adjust the visualization parameters to match your specific reporting requirements

## Future Improvements

- User authentication and role-based access control
- Exportable reports in PDF and Excel formats
- Integration with IoT sensors for real-time data feeds
- Mobile app version for on-the-go monitoring
- Advanced analytics with machine learning for more accurate predictions
- Multi-campus comparison features

## Contributing

Contributions to improve ZJU-CarbonViz are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Zhejiang University Haining Campus for supporting sustainable campus initiatives
- [Recharts](https://recharts.org/) for the excellent visualization library
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
