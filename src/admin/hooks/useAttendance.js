// admin/hooks/useAttendance.js
import { useState, useCallback } from "react";
import * as attendanceApi from "../../services/attendanceApi.js";

export const useAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const recordAttendance = useCallback(async (payload) => {
    setLoading(true);
    setError("");
    try {
      const result = await attendanceApi.createAttendance(payload);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const recordBulkAttendance = useCallback(async (records, term) => {
    setLoading(true);
    setError("");
    try {
      const result = await attendanceApi.bulkCreateAttendance(records, term);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRecord = useCallback(async (id, payload) => {
    setLoading(true);
    setError("");
    try {
      const result = await attendanceApi.updateAttendance(id, payload);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRecord = useCallback(async (id) => {
    setLoading(true);
    setError("");
    try {
      const result = await attendanceApi.deleteAttendance(id);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAttendance = useCallback(async (filters) => {
    setLoading(true);
    setError("");
    try {
      const result = await attendanceApi.getAttendance(filters);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudentAttendance = useCallback(async (studentId, filters) => {
    setLoading(true);
    setError("");
    try {
      const result = await attendanceApi.getStudentAttendance(studentId, filters);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    recordAttendance,
    recordBulkAttendance,
    updateRecord,
    deleteRecord,
    fetchAttendance,
    fetchStudentAttendance,
  };
};
