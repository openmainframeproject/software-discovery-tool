import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchBar from '../SearchBar';

const mockOnSearchPerformed = jest.fn();

const mockDistros = {
  Ubuntu: { 'Ubuntu 22.04': 1, 'Ubuntu 24.04': 2 },
  RHEL: { 'RHEL 9': 4 }
};

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url.includes('getSupportedDistros')) {
      return Promise.resolve({
        json: () => Promise.resolve(mockDistros)
      });
    }
    return Promise.resolve({
      json: () => Promise.resolve({ packages: [], total_packages: 0 })
    });
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('SearchBar', () => {
  test('renders without crashing', async () => {
    render(<SearchBar onSearchPerformed={mockOnSearchPerformed} />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  });

  test('renders search input field', () => {
    render(<SearchBar onSearchPerformed={mockOnSearchPerformed} />);
    expect(screen.getByPlaceholderText('Search Packages')).toBeInTheDocument();
  });

  test('renders Search and Search Exact buttons', () => {
    render(<SearchBar onSearchPerformed={mockOnSearchPerformed} />);
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Search Exact')).toBeInTheDocument();
  });

  test('updates input value when user types', () => {
    render(<SearchBar onSearchPerformed={mockOnSearchPerformed} />);
    const input = screen.getByPlaceholderText('Search Packages');
    fireEvent.change(input, { target: { value: 'nginx' } });
    expect(input.value).toBe('nginx');
  });

  test('does not call searchPackages API when input is empty', async () => {
    render(<SearchBar onSearchPerformed={mockOnSearchPerformed} />);
    fireEvent.click(screen.getByText('Search'));
    await waitFor(() => {
      const searchCalls = global.fetch.mock.calls.filter(([url]) =>
        url.includes('searchPackages')
      );
      expect(searchCalls.length).toBe(0);
    });
  });

  test('calls searchPackages API when input has value and Search is clicked', async () => {
    render(<SearchBar onSearchPerformed={mockOnSearchPerformed} />);
    const input = screen.getByPlaceholderText('Search Packages');
    fireEvent.change(input, { target: { value: 'nginx' } });
    fireEvent.click(screen.getByText('Search'));
    await waitFor(() => {
      const searchCalls = global.fetch.mock.calls.filter(([url]) =>
        url.includes('searchPackages')
      );
      expect(searchCalls.length).toBe(1);
      expect(searchCalls[0][0]).toContain('search_term=nginx');
      expect(searchCalls[0][0]).toContain('exact_match=false');
    });
  });

  test('calls searchPackages with exact_match=true when Search Exact is clicked', async () => {
    render(<SearchBar onSearchPerformed={mockOnSearchPerformed} />);
    const input = screen.getByPlaceholderText('Search Packages');
    fireEvent.change(input, { target: { value: 'curl' } });
    fireEvent.click(screen.getByText('Search Exact'));
    await waitFor(() => {
      const searchCalls = global.fetch.mock.calls.filter(([url]) =>
        url.includes('searchPackages')
      );
      expect(searchCalls.length).toBe(1);
      expect(searchCalls[0][0]).toContain('exact_match=true');
    });
  });

  test('renders Select All checkbox', async () => {
    render(<SearchBar onSearchPerformed={mockOnSearchPerformed} />);
    expect(screen.getByLabelText(/All/)).toBeInTheDocument();
  });

  test('renders Search Description checkbox', () => {
    render(<SearchBar onSearchPerformed={mockOnSearchPerformed} />);
    expect(screen.getByLabelText(/Search Description/i)).toBeInTheDocument();
  });

  test('renders distro checkboxes after fetching OS list', async () => {
    render(<SearchBar onSearchPerformed={mockOnSearchPerformed} />);
    await waitFor(() => {
      expect(screen.getByLabelText(/Ubuntu/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/RHEL/i)).toBeInTheDocument();
    });
  });
});
