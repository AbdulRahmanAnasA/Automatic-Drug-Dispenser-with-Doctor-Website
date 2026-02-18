import axios from "axios";
import { Patient, Prescription } from "../types";

// Backend base URL
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// ---------------- PATIENT APIs ----------------

export const api = {
  // Get all pending prescriptions
  getPendingPrescriptions: async () => {
    const res = await API.get('/prescriptions?status=Pending');
    return res.data;
  },

  // Update prescription status
  updatePrescriptionStatus: async (rfidUid: string, status: string) => {
    const res = await API.put(`/prescriptions/${rfidUid}/status`, { status });
    return res.data;
  },

  // Get all patients
  getPatients: async () => {
    const res = await API.get("/patients");
    return res.data;
  },

  // Add patient
  addPatient: async (patient: Patient) => {
    console.log("api.addPatient called with:", patient);
    try {
      const payload = {
        rfidUid: patient.rfidUid,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        condition: patient.condition,
      };
      console.log("Sending POST to /patients with payload:", payload);
      const res = await API.post("/patients", payload);
      console.log("API /patients Response:", res);
      return res.data;
    } catch (error) {
      console.error("API addPatient failed:", error);
      throw error;
    }
  },

  // Get patient by RFID
  getPatientByRfid: async (rfidUid: string) => {
    const res = await API.get(`/patients/${rfidUid}`);
    return res.data;
  },

  // Update patient
  updatePatient: async (rfidUid: string, patient: Partial<Patient>) => {
    const res = await API.put(`/patients/${rfidUid}`, patient);
    return res.data;
  },

  // Delete patient
  deletePatient: async (rfidUid: string) => {
    const res = await API.delete(`/patients/${rfidUid}`);
    return res.data;
  },

  // ---------------- PRESCRIPTION ----------------

  getPrescriptionByRfid: async (rfidUid: string) => {
    const res = await API.get(`/prescriptions/${rfidUid}`);
    return res.data;
  },

  updatePrescription: async (data: Prescription) => {
    const res = await API.post("/prescriptions", data);
    return res.data;
  },

  // ---------------- LOGS ----------------

  getLogs: async () => {
    const res = await API.get("/logs");
    return res.data;
  },

  // ---------------- INVENTORY ----------------

  getInventory: async () => {
    const res = await API.get("/inventory");
    return res.data;
  },

  // Bulk update (keeps backward compatibility)
  updateInventory: async (payload: any) => {
    const res = await API.post('/inventory/update', payload);
    return res.data;
  },

  // Per-servo operations
  addServo: async (servo: { medicine: string; stock?: number; max?: number }) => {
    const res = await API.post('/inventory/servos', servo);
    return res.data;
  },

  updateServo: async (index: number, servo: Partial<{ medicine: string; stock: number; max: number }>) => {
    const res = await API.put(`/inventory/servos/${index}`, servo);
    return res.data;
  },

  removeServo: async (index: number) => {
    const res = await API.delete(`/inventory/servos/${index}`);
    return res.data;
  },

  // ---------------- HARDWARE SIMULATION ----------------

  fetchPrescriptionHardware: async (rfidUid: string) => {
    try {
      const res = await API.get(`/prescriptions/${rfidUid}`);
      return res.data;
    } catch (error) {
      console.error("Hardware fetch failed:", error);
      return null;
    }
  },

  confirmDispensing: async (rfidUid: string, success: boolean, detail?: { error?: string; prescription?: any }) => {
    // detail.prescription (optional) may contain medicine counts
    const errMsg = detail?.error ?? undefined;
    console.log(`[Hardware] Dispensing result for ${rfidUid}: ${success ? 'Success' : 'Failed'} ${errMsg ? `(${errMsg})` : ''}`);

    if (success) {
      // Update prescription status on server — server will create the dispensing log for successful dispenses.
      try {
        await API.post(`/prescriptions/${rfidUid}/dispense`);
        console.log(`[Hardware] Updated status to 'Dispensed' for ${rfidUid}`);
      } catch (err) {
        console.error(`[Hardware] Failed to update status for ${rfidUid}:`, err);
      }
    } else {
      // For failures (emulator or device), create a dispensing log so the event is recorded.
      try {
        const medicines = detail?.prescription
          ? {
              paracetamol: detail.prescription.paracetamol || 0,
              azithromycin: detail.prescription.azithromycin || 0,
              revital: detail.prescription.revital || 0,
            }
          : undefined;

        await API.post('/logs', {
          rfidUid,
          medicines,
          status: 'Failure',
          errorMessage: errMsg || 'Dispense failed',
        });
        console.log(`[Hardware] Created failure log for ${rfidUid}`);
      } catch (err) {
        console.error(`[Hardware] Failed to create failure log for ${rfidUid}:`, err);
      }
    }

    return { success };
  },
};
