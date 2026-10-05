import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Demo accounts fallback for Vercel Serverless environment if SQLite is unreadable
export const DEMO_USERS = [
  {
    id: "admin-uuid-001",
    email: "admin@docsearch.com",
    password: "admin123",
    name: "System Administrator",
    role: "ADMIN" as const,
  },
  {
    id: "student-uuid-002",
    email: "student@docsearch.com",
    password: "student123",
    name: "Alex Rivers",
    role: "STUDENT" as const,
  },
];

export const DEMO_NOTES = [
  {
    id: "note-001",
    title: "Advanced Quantum Computing & Qubit Algorithms",
    subject: "Physics & CS",
    fileId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs67750Zy0W9I",
    originalUrl: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs67750Zy0W9I/view",
    description: "Comprehensive lecture notes covering Shor's algorithm, Grover's search, quantum decoherence, and fault-tolerant quantum error correction.",
    tag: "Quantum Physics",
    courseCode: "PHYS-302",
    semester: "Fall 2026",
    upvotes: 24,
    ocrText: "Hadamard Transformation Matrix H = 1/sqrt(2) [1 1; 1 -1]. Quantum Fourier Transform QFT algorithm complexity O(n log n). Qubit superposition state |psi> = alpha|0> + beta|1>.",
    createdAt: new Date().toISOString(),
    uploader: { name: "System Administrator", email: "admin@docsearch.com" },
    _count: { comments: 2 },
  },
  {
    id: "note-002",
    title: "Deep Neural Architecture & Transformer Networks",
    subject: "Artificial Intelligence",
    fileId: "1u3-88G-1X9X0rW3d4c_Vz8K1a0b5Z9Y",
    originalUrl: "https://drive.google.com/file/d/1u3-88G-1X9X0rW3d4c_Vz8K1a0b5Z9Y/view",
    description: "Mathematical formulation of Self-Attention mechanism, Multi-Head Attention, positional embeddings, and Vision Transformer (ViT) paradigms.",
    tag: "Deep Learning",
    courseCode: "AI-401",
    semester: "Fall 2026",
    upvotes: 42,
    ocrText: "Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V. Scaled dot-product attention calculation formula. Feedforward neural network residual connections.",
    createdAt: new Date().toISOString(),
    uploader: { name: "System Administrator", email: "admin@docsearch.com" },
    _count: { comments: 1 },
  },
  {
    id: "note-003",
    title: "Distributed Systems Architecture & Consensus Protocols",
    subject: "Computer Science",
    fileId: "1g4m5P0kLz-9X1b_7Vn2wR3e4T5Y6U7I",
    originalUrl: "https://drive.google.com/file/d/1g4m5P0kLz-9X1b_7Vn2wR3e4T5Y6U7I/view",
    description: "In-depth analysis of Raft, Paxos, Byzantine Fault Tolerance (BFT), eventual consistency, and vector clocks in high-scale web infrastructure.",
    tag: "Backend Systems",
    courseCode: "CS-301",
    semester: "Spring 2026",
    upvotes: 19,
    ocrText: "Raft Leader Election phase: RequestVote RPC, AppendEntries RPC. Term numbers and heartbeats. Byzantine Generals Problem consensus proof.",
    createdAt: new Date().toISOString(),
    uploader: { name: "System Administrator", email: "admin@docsearch.com" },
    _count: { comments: 0 },
  },
  {
    id: "note-004",
    title: "Organic Chemistry: Synthesis & Reaction Mechanisms",
    subject: "Chemistry",
    fileId: "1x8Y9Z0a1B2c3D4e5F6g7H8i9J0k1L2m",
    originalUrl: "https://drive.google.com/file/d/1x8Y9Z0a1B2c3D4e5F6g7H8i9J0k1L2m/view",
    description: "Detailed reaction pathways for nucleophilic substitution (SN1/SN2), electrophilic addition, retrosynthetic analysis, and NMR spectroscopy.",
    tag: "Organic Chemistry",
    courseCode: "CHEM-201",
    semester: "Fall 2026",
    upvotes: 15,
    ocrText: "SN1 reaction proceeds via carbocation intermediate. SN2 bimolecular substitution inversion of stereochemistry. Nucleophilic attack kinetics.",
    createdAt: new Date().toISOString(),
    uploader: { name: "System Administrator", email: "admin@docsearch.com" },
    _count: { comments: 0 },
  },
];
