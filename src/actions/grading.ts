'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const GradeSchema = z.object({
    submissionId: z.string(),
    grade: z.coerce.number().min(0).max(100),
    feedback: z.string().optional(),
    assignmentId: z.string(), // Needed for revalidation
});

export async function gradeSubmission(prevState: any, formData: FormData) {
    const data = {
        submissionId: formData.get('submissionId'),
        grade: formData.get('grade'),
        feedback: formData.get('feedback'),
        assignmentId: formData.get('assignmentId'),
    };

    const validated = GradeSchema.safeParse(data);

    if (!validated.success) {
        return { message: "Invalid input", errors: validated.error.flatten().fieldErrors };
    }

    try {
        await prisma.submission.update({
            where: { id: validated.data.submissionId },
            data: {
                grade: validated.data.grade,
                feedback: validated.data.feedback,
                status: 'GRADED'
            }
        });
        revalidatePath(`/teacher/assignments/${validated.data.assignmentId}`);
        return { message: "Grade saved successfully!", success: true };
    } catch (e) {
        return { message: "Failed to save grade" };
    }
}
