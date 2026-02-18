
import React from 'react';
import { Patient, Prescription, DispensingLog, Inventory, Role } from './types';

export const INITIAL_PATIENTS: Patient[] = [
  {
    rfidUid: 'A1B2C3D4',
    name: 'John Doe',
    age: 45,
    gender: 'Male',
    condition: 'Chronic Pain / Bacterial Infection',
    status: 'Active',
    createdAt: new Date().toISOString()
  },
  {
    rfidUid: 'E5F6G7H8',
    name: 'Jane Smith',
    age: 32,
    gender: 'Female',
    condition: 'Vitamin Deficiency',
    status: 'Active',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    rfidUid: 'A1B2C3D4',
    paracetamol: 2,
    azithromycin: 1,
    revital: 0,
    frequency: 'Twice a day',
    duration: '5 Days',
    updatedAt: new Date().toISOString()
  },
  {
    rfidUid: 'E5F6G7H8',
    paracetamol: 0,
    azithromycin: 0,
    revital: 1,
    frequency: 'Once daily',
    duration: '30 Days',
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_INVENTORY: Inventory = {
  servo1: { medicine: 'Paracetamol', stock: 150, max: 200 },
  servo2: { medicine: 'Azithromycin', stock: 45, max: 100 },
  servo3: { medicine: 'Revital', stock: 80, max: 150 }
};

export const MOCK_DOCTOR = {
  id: 'doc_001',
  name: 'Dr. Sarah Connor',
  username: 'sconnor',
  role: Role.DOCTOR
};
