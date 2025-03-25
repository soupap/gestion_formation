import { mockFormations, mockParticipants } from '../mockData';

// Simulate API calls with mock data
export const getFormations = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: mockFormations });
    }, 1000); // Simulate a 1-second delay
  });
};

export const getParticipants = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: mockParticipants });
    }, 1000); // Simulate a 1-second delay
  });
};