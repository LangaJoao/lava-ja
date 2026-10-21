import { services } from '../../../shared/data/services';
export const demoOrders = [
  { id: 'LJ-001', client: 'Ana Bila', car: 'Toyota Vitz', time: '08:30', service: services[1], done: false },
  { id: 'LJ-002', client: 'Carlos Matavele', car: 'Honda Fit', time: '09:00', service: services[0], done: false },
  { id: 'LJ-003', client: 'Maria Cossa', car: 'Nissan March', time: '09:30', service: services[2], done: true },
  { id: 'LJ-004', client: 'João Mucavele', car: 'Mazda Demio', time: '10:00', service: services[1], done: false },
];
