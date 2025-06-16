import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConnectionForm from '../components/ConnectionForm';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ ip: '192.168.1.2' }, { ip: '192.168.1.3' }]),
    })
  );
});

afterEach(() => {
  global.fetch.mockClear();
});

describe('ConnectionForm', () => {
  test('renders input fields and connect button', () => {
    render(<ConnectionForm onConnect={jest.fn()} />);
    expect(screen.getByLabelText(/Receiver IP/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Port/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Connect/i })).toBeInTheDocument();
  });

  test('validates IP address and shows error', () => {
    const onConnect = jest.fn();
    render(<ConnectionForm onConnect={onConnect} />);
    const ipInput = screen.getByLabelText(/Receiver IP/i);
    const connectButton = screen.getByRole('button', { name: /Connect/i });

    fireEvent.change(ipInput, { target: { value: 'invalid-ip' } });
    fireEvent.click(connectButton);

    expect(screen.getByText(/Invalid IP address/i)).toBeInTheDocument();
    expect(onConnect).not.toHaveBeenCalled();
  });

  test('calls onConnect with valid IP and port', () => {
    const onConnect = jest.fn();
    render(<ConnectionForm onConnect={onConnect} />);
    const ipInput = screen.getByLabelText(/Receiver IP/i);
    const portInput = screen.getByLabelText(/Port/i);
    const connectButton = screen.getByRole('button', { name: /Connect/i });

    fireEvent.change(ipInput, { target: { value: '192.168.1.2' } });
    fireEvent.change(portInput, { target: { value: '9090' } });
    fireEvent.click(connectButton);

    expect(onConnect).toHaveBeenCalledWith('192.168.1.2', 9090);
  });

  test('fetches and displays available devices in dropdown', async () => {
    const { container } = render(<ConnectionForm onConnect={jest.fn()} />);
    const dropdownButtons = screen.getAllByRole('button');
    // Assuming the dropdown button is the icon button (not the Connect button)
    const dropdownButton = dropdownButtons.find(button => button.querySelector('svg[data-testid="ArrowDropDownIcon"]'));

    fireEvent.click(dropdownButton);

    // Wait for the dropdown menu to appear and contain the device IPs
    await waitFor(() => {
      // The dropdown might be rendered in a portal, so query the entire document body
      const popper = document.body.querySelector('[role="tooltip"]');
      expect(popper).not.toBeNull();
      // Check for device IPs as strings, not objects
      expect(popper.textContent).toContain('192.168.1.2');
      expect(popper.textContent).toContain('192.168.1.3');
    });
  });
});
