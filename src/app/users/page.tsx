
import PageHeader from "@/components/page-header";
import { getUsers, getCompanies } from "@/lib/actions";
import { UserDialog } from "./user-dialog";
import { UsersTable } from "./users-table";

// For this demo, we assume an admin user is logged in.
// In a real app, you would get this from the user's session.
const session = {
    user: {
      id: 'user-admin',
      role: 'admin',
      companyId: 'company-sc'
    }
};


export default async function UsersPage() {
  if (session.user.role !== 'admin') {
    return (
      <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 lg:gap-8">
        <PageHeader title="Access Denied" description="You do not have permission to view this page." />
      </div>
    )
  }

  // An admin will only see users from their own company.
  const users = await getUsers();
  
  // To assign a user to a company, the admin needs the list of all companies.
  const allCompanies = await getCompanies();


  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 lg:gap-8">
      <PageHeader
        title="User Management"
        description="Create and manage user accounts for your company."
      >
        <UserDialog companies={allCompanies} />
      </PageHeader>

      <UsersTable data={users} companies={allCompanies} />
    </div>
  );
}
