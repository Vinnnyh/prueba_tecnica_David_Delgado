import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dropdown } from '@/components/ui/dropdown';

describe('Dropdown Component', () => {
  const options = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
  ];

  it('should render the placeholder when no value is selected', () => {
    render(<Dropdown value="" onChange={() => {}} options={options} placeholder="Select something" />);
    expect(screen.getByText('Select something')).toBeInTheDocument();
  });

  it('should render the selected option label', () => {
    render(<Dropdown value="1" onChange={() => {}} options={options} />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('should open the menu when clicked', () => {
    render(<Dropdown value="" onChange={() => {}} options={options} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('should call onChange when an option is clicked', () => {
    const onChange = vi.fn();
    render(<Dropdown value="" onChange={onChange} options={options} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const option2 = screen.getByText('Option 2');
    fireEvent.click(option2);
    
    expect(onChange).toHaveBeenCalledWith('2');
  });

  it('should be disabled when the disabled prop is true', () => {
    render(<Dropdown value="" onChange={() => {}} options={options} disabled={true} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
