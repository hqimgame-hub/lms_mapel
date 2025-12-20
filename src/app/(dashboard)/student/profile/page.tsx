import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";

export default async function StudentProfilePage() {
    const session = await auth();

    if (!session?.user || session.user.role !== 'STUDENT') {
        redirect('/login');
    }

    return <ProfileForm userEmail={session.user.email!} userName={session.user.name!} />;
}
