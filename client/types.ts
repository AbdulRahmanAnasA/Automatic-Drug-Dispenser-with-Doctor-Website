
export enum Role {
  DOCTOR = 'Doctor',
  ADMIN = 'Admin'
}

export enum DispenseStatus {
  SUCCESS = 'Success',
  FAILURE = 'Failure',
  PENDING = 'Pending'
}

export interface Doctor {
  id: string;
  name: string;
  username: string;
  role: Role;
}

export interface Patient {
  rfidUid: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  condition: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface Prescription {
  rfidUid: string;
  paracetamol: number; // Servo 1
  azithromycin: number; // Servo 2
  revital: number; // Servo 3
  frequency: string;
  duration: string;
  lastDispensed?: string;
  updatedAt: string;
}

export interface DispensingLog {
  id: string;
  rfidUid: string;
  patientName: string;
  medicines: {
    paracetamol: number;
    azithromycin: number;
    revital: number;
  };
  timestamp: string;
  status: DispenseStatus;
  errorMessage?: string;
}

export interface InventoryServo {
  slot?: number;
  medicine: string;
  stock: number;
  max: number;
}

export interface Inventory {
  // legacy fields kept for compatibility
  servo1?: { medicine: string; stock: number; max: number };
  servo2?: { medicine: string; stock: number; max: number };
  servo3?: { medicine: string; stock: number; max: number };

  // preferred dynamic representation
  servos?: InventoryServo[];
}
