-- DropForeignKey
ALTER TABLE "StudentNote" DROP CONSTRAINT "StudentNote_studentId_fkey";

-- DropForeignKey
ALTER TABLE "StudentNote" DROP CONSTRAINT "StudentNote_teacherId_fkey";

-- DropIndex
DROP INDEX "Submission_teacherTag_idx";

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "driveFolderUrl" TEXT,
ADD COLUMN     "enableDriveUpload" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "TutorialTopic" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- DropTable
DROP TABLE "StudentNote";
