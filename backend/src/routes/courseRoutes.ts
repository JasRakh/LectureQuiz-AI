import { Router } from "express";
import { z } from "zod";
import { authenticate, AuthRequest } from "../middleware/auth";
import { prisma } from "../prisma/client";

export const courseRouter = Router();

const createCourseSchema = z.object({
  name: z.string().min(2),
  code: z
    .string()
    .min(2)
    .max(20)
    .transform((v) => v.toUpperCase().replace(/\s+/g, "")),
  description: z.string().optional(),
});

function parseCourseIdParam(param: string): number | null {
  const n = Number.parseInt(param, 10);
  if (!Number.isFinite(n) || n < 1) return null;
  return n;
}

courseRouter.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== "professor") {
      return res
        .status(403)
        .json({ message: "Only professors can create courses" });
    }

    const body = createCourseSchema.safeParse(req.body);
    if (!body.success) {
      return res
        .status(400)
        .json({ message: "Invalid payload", errors: body.error.errors });
    }

    const existing = await prisma.course.findUnique({
      where: { code: body.data.code },
    });
    if (existing) {
      return res
        .status(409)
        .json({ message: `Course with code "${body.data.code}" already exists` });
    }

    const course = await prisma.course.create({
      data: {
        name: body.data.name,
        code: body.data.code,
        description: body.data.description ?? null,
        professorId: req.user.userId,
      },
    });

    return res.status(201).json({ course });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Failed to create course" });
  }
});

courseRouter.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role === "professor") {
      const courses = await prisma.course.findMany({
        where: { professorId: req.user.userId },
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { enrollments: true, lectures: true } },
        },
      });
      return res.json({ courses });
    }

    const courses = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        professor: { select: { id: true, name: true } },
        _count: { select: { enrollments: true, lectures: true } },
        enrollments: {
          where: { studentId: req.user!.userId },
          select: { id: true },
        },
      },
    });

    const mapped = courses.map((c) => ({
      ...c,
      enrolled: c.enrollments.length > 0,
      enrollments: undefined,
    }));

    return res.json({ courses: mapped });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Failed to list courses" });
  }
});

courseRouter.get("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const courseId = parseCourseIdParam(req.params.id);
    if (courseId === null) {
      return res.status(400).json({ message: "Invalid course id" });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        professor: { select: { id: true, name: true } },
        _count: { select: { enrollments: true, lectures: true } },
      },
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.json({ course });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Failed to load course" });
  }
});

courseRouter.get(
  "/:id/students",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      if (req.user?.role !== "professor") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const courseId = parseCourseIdParam(req.params.id);
      if (courseId === null) {
        return res.status(400).json({ message: "Invalid course id" });
      }

      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      if (course.professorId !== req.user.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const enrollments = await prisma.enrollment.findMany({
        where: { courseId },
        include: {
          student: {
            select: { id: true, name: true, email: true, createdAt: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const students = enrollments.map((e) => ({
        ...e.student,
        enrolledAt: e.createdAt,
      }));

      return res.json({ students });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Failed to load students" });
    }
  },
);

courseRouter.post(
  "/:id/enroll",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      if (req.user?.role !== "student") {
        return res
          .status(403)
          .json({ message: "Only students can enroll in courses" });
      }

      const courseId = parseCourseIdParam(req.params.id);
      if (courseId === null) {
        return res.status(400).json({ message: "Invalid course id" });
      }

      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const existing = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: req.user.userId,
            courseId,
          },
        },
      });
      if (existing) {
        return res
          .status(409)
          .json({ message: "Already enrolled in this course" });
      }

      const enrollment = await prisma.enrollment.create({
        data: {
          studentId: req.user.userId,
          courseId,
        },
      });

      return res.status(201).json({ enrollment });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Failed to enroll" });
    }
  },
);

courseRouter.delete(
  "/:id/enroll",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      if (req.user?.role !== "student") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const courseId = parseCourseIdParam(req.params.id);
      if (courseId === null) {
        return res.status(400).json({ message: "Invalid course id" });
      }

      await prisma.enrollment.deleteMany({
        where: {
          studentId: req.user.userId,
          courseId,
        },
      });

      return res.json({ message: "Unenrolled" });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Failed to unenroll" });
    }
  },
);
