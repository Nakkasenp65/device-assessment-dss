import { api } from "@/lib/api";

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  _count?: { assessments: number };
}

export const getUsers = async (): Promise<User[]> => {
  const res = await api.get("/users");
  return res.data.data;
};

export const updateUserRole = async (
  id: number,
  role: string,
): Promise<User> => {
  const res = await api.patch(`/users/${id}/role`, { role });
  return res.data.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
};
