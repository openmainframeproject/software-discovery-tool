import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HeroSection from '../HeroSection';

describe('HeroSection', () => {
  test('renders without crashing', () => {
    render(<HeroSection />);
  });

  test('renders hero image', () => {
    render(<HeroSection />);
    expect(screen.getByAltText('hero_image')).toBeInTheDocument();
  });

  test('renders main headline text', () => {
    render(<HeroSection />);
    expect(screen.getByText(/Packages From/i)).toBeInTheDocument();
  });

  test('renders description text', () => {
    render(<HeroSection />);
    expect(screen.getByText(/Discover Open Source Packages/i)).toBeInTheDocument();
  });
});
