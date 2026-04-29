import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from '@tanstack/react-router';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { Route } from './index';

describe('HomePage', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('should render hero images with object-cover class', () => {
    const router = createMemoryRouter([Route]);
    render(<RouterProvider router={router} />);

    // Advance timers to trigger the image carousel
    vi.advanceTimersByTime(3500 * 4); // Advance enough to cycle through all images

    const images = screen.getAllByRole('img');
    const heroImages = images.filter(img => img.classList.contains('object-cover'));

    expect(heroImages.length).toBeGreaterThan(0);
    heroImages.forEach(image => {
      expect(image).toHaveClass('object-cover');
      expect(image).toHaveClass('h-full');
      expect(image).toHaveClass('w-full');
    });
  });
});
