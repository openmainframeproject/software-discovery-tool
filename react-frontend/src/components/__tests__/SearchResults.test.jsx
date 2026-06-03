import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchResults from '../SearchResults';

const mockResults = [
  {
    packageName: 'nginx',
    description: 'Web server',
    version: '1.24.0',
    ostag: 'Ubuntu 22.04'
  },
  {
    packageName: 'curl',
    description: 'URL transfer tool',
    version: '7.88.0',
    ostag: 'RHEL 9'
  }
];

const defaultProps = {
  results: [],
  showDesc: true,
  itemsPerPage: 10,
  searchPerformed: false,
  totalResultsCount: 0,
  selectedParentDistributions: [],
  osList: {}
};

describe('SearchResults', () => {
  test('renders without crashing with empty results', () => {
    render(<SearchResults {...defaultProps} />);
  });

  test('renders package names when results are provided', () => {
    render(
      <SearchResults
        {...defaultProps}
        results={mockResults}
        searchPerformed={true}
        totalResultsCount={2}
      />
    );
    expect(screen.getByText('nginx')).toBeInTheDocument();
    expect(screen.getByText('curl')).toBeInTheDocument();
  });

  test('shows descriptions when showDesc is true', () => {
    render(
      <SearchResults
        {...defaultProps}
        results={mockResults}
        searchPerformed={true}
        showDesc={true}
      />
    );
    expect(screen.getByText('Web server')).toBeInTheDocument();
    expect(screen.getByText('URL transfer tool')).toBeInTheDocument();
  });

  test('hides descriptions when showDesc is false', () => {
    render(
      <SearchResults
        {...defaultProps}
        results={mockResults}
        searchPerformed={true}
        showDesc={false}
      />
    );
    expect(screen.queryByText('Web server')).not.toBeInTheDocument();
    expect(screen.queryByText('URL transfer tool')).not.toBeInTheDocument();
  });

  test('shows refine filters when search is performed', () => {
    render(
      <SearchResults
        {...defaultProps}
        searchPerformed={true}
      />
    );
    expect(screen.getByPlaceholderText('Enter package name or version')).toBeInTheDocument();
  });

  test('does not show refine filters before search is performed', () => {
    render(<SearchResults {...defaultProps} searchPerformed={false} />);
    expect(screen.queryByPlaceholderText('Enter package name or version')).not.toBeInTheDocument();
  });

  test('renders no results when results array is empty after search', () => {
    render(
      <SearchResults
        {...defaultProps}
        results={[]}
        searchPerformed={true}
        totalResultsCount={0}
      />
    );
    expect(screen.queryByText('nginx')).not.toBeInTheDocument();
  });

  test('filters results by package name in refine input', () => {
    render(
      <SearchResults
        {...defaultProps}
        results={mockResults}
        searchPerformed={true}
        totalResultsCount={2}
      />
    );
    const refineInput = screen.getByPlaceholderText('Enter package name or version');
    fireEvent.change(refineInput, { target: { value: 'nginx' } });
    expect(screen.getByText('nginx')).toBeInTheDocument();
    expect(screen.queryByText('curl')).not.toBeInTheDocument();
  });
});
