import PageHeader from "@/components/page-header";
import { getUsers, getCompanies } from "@/lib/actions";
import { UserDialog } from "./user-dialog";
import { UsersTable } from "./users-table";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  const user = await getCurrentUser();
  if (user?.role !== 'admin') {
    redirect('/dashboard');
  }

  // An admin will only see users from their own company.
  const users = await getUsers();
  
  // To assign a user to a company, the admin needs the list of all companies.
  const allCompanies = await getCompanies();


  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 lg:gap-8">
      <PageHeader
        title="Gestión de Usuarios"
        description="Crear y gestionar cuentas de usuario para tu empresa."
      >
        <UserDialog companies={allCompanies} />
      </PageHeader>

      <UsersTable data={users} companies={allCompanies} />
    </div>
  );
}
