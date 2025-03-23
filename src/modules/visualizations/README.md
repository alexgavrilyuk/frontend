# Visualizations Module

## Purpose

The Visualizations module provides reusable chart components for data visualization throughout the application. It offers a consistent interface for rendering various chart types and data tables with minimal configuration requirements. This module is designed to work seamlessly with the Reports module and other areas of the application that need data visualization capabilities.

## Features

- Multiple chart types (Line, Bar, Pie/Donut)
- Enhanced data tables with sorting, filtering, and pagination
- Consistent styling that matches the application's dark theme
- Placeholder rendering in Phase 1 (canvas-based)
- Full Chart.js implementation planned for Phase 3
- Utilities for data formatting and color management

## Structure

```
visualizations/
├── components/           # Chart components
│   ├── LineChart.js      # Line chart visualization
│   ├── BarChart.js       # Bar chart visualization
│   ├── PieChart.js       # Pie/donut chart visualization
│   └── DataTable.js      # Tabular data visualization
├── utils/                # Utility functions
│   └── chartUtils.js     # Shared chart utilities
├── index.js              # Public API exports
└── README.md             # This documentation
```

## Components

### LineChart

Renders time series or other sequential data as a line chart.

```jsx
import {LineChart} from './';

function ExampleComponent() {
    const data = [
        {date: '2023-01-01', value: 100, trend: 90},
        {date: '2023-02-01', value: 120, trend: 95},
        {date: '2023-03-01', value: 130, trend: 100}
    ];

    const config = {
        xAxis: 'date',
        yAxis: ['value', 'trend'],
        sortBy: 'date',
        showLegend: true,
        colors: ['#3B82F6', '#10B981']
    };

    return (
        <LineChart
            data={data}
            config={config}
            title="Monthly Values"
            height={300}
        />
    );
}
```

#### Configuration Options

- `xAxis`: Data key for x-axis values
- `yAxis`: Data key(s) for y-axis values (string or array)
- `series`: Multiple series configuration array
- `sortBy`: Key to sort data by (usually date for line charts)
- `sortDirection`: Sort direction ('asc' or 'desc')
- `colors`: Custom colors for the chart
- `showLegend`: Whether to show the legend
- `showGrid`: Whether to show grid lines
- `showTooltip`: Whether to show tooltips

### BarChart

Renders categorical data as vertical or horizontal bars.

```jsx
import {BarChart} from './';

function ExampleComponent() {
    const data = [
        {category: 'Category A', value: 100, secondaryValue: 80},
        {category: 'Category B', value: 120, secondaryValue: 90},
        {category: 'Category C', value: 80, secondaryValue: 60}
    ];

    const config = {
        xAxis: 'category',
        yAxis: ['value', 'secondaryValue'],
        sortBy: 'value',
        sortDirection: 'desc',
        stacked: false,
        horizontal: false
    };

    return (
        <BarChart
            data={data}
            config={config}
            title="Category Comparison"
            height={300}
        />
    );
}
```

#### Configuration Options

- `xAxis`: Data key for x-axis values (categories)
- `yAxis`: Data key(s) for y-axis values (string or array)
- `sortBy`: Key to sort data by
- `sortDirection`: Sort direction ('asc' or 'desc')
- `stacked`: Whether to stack the bars
- `horizontal`: Whether to render horizontal bars
- `colors`: Custom colors for the chart
- `showLegend`: Whether to show the legend
- `showGrid`: Whether to show grid lines
- `showTooltip`: Whether to show tooltips

### PieChart

Renders proportional data as a pie or donut chart.

```jsx
import {PieChart} from './';

function ExampleComponent() {
    const data = [
        {label: 'Category A', value: 40},
        {label: 'Category B', value: 30},
        {label: 'Category C', value: 20},
        {label: 'Category D', value: 10}
    ];

    const config = {
        valueField: 'value',
        labelField: 'label',
        isDonut: true,
        donutRatio: 0.6,
        showLabels: true,
        showPercentages: true
    };

    return (
        <PieChart
            data={data}
            config={config}
            title="Distribution by Category"
            height={300}
        />
    );
}
```

#### Configuration Options

- `valueField`: Data key for the values
- `labelField`: Data key for the labels
- `isDonut`: Whether to render as a donut chart
- `donutRatio`: Inner radius ratio for donut charts (0-1)
- `colors`: Custom colors for the chart
- `showLegend`: Whether to show the legend
- `showTooltip`: Whether to show tooltips
- `showLabels`: Whether to show labels on the chart
- `showPercentages`: Whether to show percentages in labels

### DataTable

Renders tabular data with sorting, filtering, and pagination capabilities.

```jsx
import {DataTable} from './';

function ExampleComponent() {
    const data = [
        {id: 1, name: 'Product A', category: 'Electronics', price: 199.99},
        {id: 2, name: 'Product B', category: 'Furniture', price: 299.99},
        {id: 3, name: 'Product C', category: 'Electronics', price: 149.99}
    ];

    const config = {
        columns: [
            {key: 'name', label: 'Product Name'},
            {key: 'category', label: 'Category'},
            {key: 'price', label: 'Price ($)'}
        ],
        sortBy: 'price',
        sortDirection: 'desc',
        pageSize: 10,
        showSearch: true
    };

    const handleRowClick = (row) => {
        console.log('Row clicked:', row);
    };

    return (
        <DataTable
            data={data}
            config={config}
            onRowClick={handleRowClick}
        />
    );
}
```

#### Configuration Options

- `columns`: Column definitions (array of objects with key and label)
- `sortBy`: Initial sort column
- `sortDirection`: Initial sort direction ('asc' or 'desc')
- `pageSize`: Number of rows per page
- `showPagination`: Whether to show pagination controls
- `showSearch`: Whether to show search functionality
- `striped`: Whether to use striped rows

## Utils

### chartUtils

Provides helper functions for chart components:

- `defaultColors`: Predefined color palette designed for dark backgrounds
- `adjustOpacity(color, opacity)`: Adjust color opacity
- `formatLabel(key)`: Convert column keys to readable labels
- `sortData(data, key, direction)`: Sort data arrays
- `formatValue(value, key)`: Format values based on type and context
- `generatePlaceholderData(points, type)`: Generate sample data for testing
- `calculateTicks(min, max, tickCount)`: Calculate appropriate axis ticks

## Integration with Reports Module

The Visualizations module is designed to work closely with the Reports module. Report sections can include multiple visualizations based on the data and analysis. Here's an example of how they work together:

```jsx
import {ReportSection} from '../reports';
import {BarChart, PieChart, DataTable} from './';

function ReportExample({data}) {
    // Configuration for visualizations
    const barConfig = { /* ... */};
    const pieConfig = { /* ... */};
    const tableConfig = { /* ... */};

    // Create visualization components
    const visualizations = [
        <BarChart key="bar" data={data.categoryData} config={barConfig} title="Sales by Category"/>,
        <PieChart key="pie" data={data.regionData} config={pieConfig} title="Regional Distribution"/>,
        <DataTable key="table" data={data.detailedData} config={tableConfig}/>
    ];

    return (
        <ReportSection
            title="Sales Analysis"
            content="This section analyzes sales performance across different categories and regions."
            visualizations={visualizations}
        />
    );
}
```

## Future Enhancements (Phase 3)

In Phase 3, this module will be enhanced with:

1. Full Chart.js implementation for all chart types
2. Advanced interactive features (zooming, tooltips, click events)
3. Additional chart types (scatter plots, heat maps, combo charts)
4. Animation and transition effects
5. Exportable visualizations (PNG, SVG)
6. Responsive design improvements
7. Accessibility enhancements

## Best Practices

When using visualization components:

1. **Choose the right chart type** for your data:
   - Line charts for time series or trends
   - Bar charts for comparing categories
   - Pie charts for showing proportions (limit to 5-7 segments)
   - Tables for detailed data

2. **Limit data volume** to ensure performance:
   - Line charts: 20-30 data points maximum
   - Bar charts: 10-15 categories maximum
   - Pie charts: 5-7 segments maximum (use "Other" for the rest)

3. **Use consistent colors** across the application:
   - Stick to the provided color palette when possible
   - Use the same colors for the same categories across different charts

4. **Provide context**:
   - Always include chart titles
   - Use clear axis labels
   - Include legends when appropriate

5. **Handle missing data** gracefully:
   - Use the DataTable's built-in formatting for null/undefined values
   - Filter out incomplete data if necessary