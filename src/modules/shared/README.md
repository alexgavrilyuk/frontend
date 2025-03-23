This README is in frontend/src/modules/shared
# Shared Module

## Purpose

The Shared module contains reusable components, hooks, and utilities that are used across multiple feature modules. It provides a consistent look and feel throughout the application and reduces code duplication.

## Features

- UI Components: Buttons, cards, forms, loaders, and other visual elements
- Animation components: Background animations and transitions
- Form elements: Input fields, checkboxes, toggles, and other form components
- Status indicators: Success/error messages and loading indicators

## Public API

This module exports:

### UI Components
- `Button`: Customizable button component with various styles
- `Card`: Glass-effect card component with customizable appearance
- `StatusMessage`: Component for displaying errors, success messages, warnings, and info
- `LoadingSpinner`: Flexible loading spinner with customizable appearance
- `AnimatedBackground`: Background component with floating particles
- Form Elements:
  - `Input`: Text input component
  - `TextArea`: Multi-line text input component
  - `Select`: Dropdown select component
  - `Checkbox`: Checkbox input component
  - `Toggle`: Toggle/switch component
  - `RadioGroup`: Radio button group component
  - `FormSection`: Container for form sections
  - `FormActions`: Container for form action buttons
- `FileUploader`: File upload component with drag and drop support
- `FileUploadProgress`: Progress indicator for file uploads
- `StyledRadioButtons`: Enhanced radio button component with custom styling

## Dependencies

This module depends on:

- External Libraries:
  - React
  - Tailwind CSS

## Usage Examples

### Button Example

```jsx
import { Button } from '../shared';

function ExampleComponent() {
  return (
    <Button
      variant="primary"
      color="blue"
      size="md"
      onClick={() => console.log('Button clicked')}
    >
      Click Me
    </Button>
  );
}
```

### Card Example

```jsx
import { Card } from '../shared';

function ExampleCard() {
  return (
    <Card
      variant="glass"
      className="p-6"
      headerProps={{
        title: "Card Title",
        subtitle: "Card subtitle text"
      }}
    >
      <p>Card content goes here</p>
    </Card>
  );
}
```

### Form Elements Example

```jsx
import { Input, Select, FormActions, Button } from '../shared';

function ExampleForm() {
  return (
    <form>
      <Input
        label="Username"
        id="username"
        placeholder="Enter username"
      />

      <Select
        label="Country"
        id="country"
        options={[
          { value: 'us', label: 'United States' },
          { value: 'ca', label: 'Canada' }
        ]}
      />

      <FormActions>
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Submit</Button>
      </FormActions>
    </form>
  );
}
```