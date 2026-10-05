const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding enhanced database...");

  // Clean existing data
  await prisma.comment.deleteMany({});
  await prisma.note.deleteMany({});
  await prisma.studyGroup.deleteMany({});
  await prisma.user.deleteMany({});

  // Create Users
  const admin = await prisma.user.create({
    data: {
      email: "admin@docsearch.com",
      password: "admin123",
      name: "System Administrator",
      role: "ADMIN",
    },
  });

  const student = await prisma.user.create({
    data: {
      email: "student@docsearch.com",
      password: "student123",
      name: "Alex Rivers",
      role: "STUDENT",
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: "jordan@docsearch.com",
      password: "student123",
      name: "Jordan Vance",
      role: "STUDENT",
    },
  });

  console.log(`Created Users: ${admin.email}, ${student.email}, ${student2.email}`);

  // Create Study Groups
  const group1 = await prisma.studyGroup.create({
    data: {
      name: "Quantum Computing & Physics Circle",
      courseCode: "PHYS-302",
      description: "Dedicated study circle for quantum decoherence, Shor's algorithm, and quantum mechanics.",
    },
  });

  const group2 = await prisma.studyGroup.create({
    data: {
      name: "Deep Learning Architectures Guild",
      courseCode: "AI-401",
      description: "Collaborative research group exploring Transformers, ViTs, and generative models.",
    },
  });

  // Create Notes with Course Codes, Semesters, OCR Text, Upvotes
  const sampleNotes = [
    {
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
      uploaderId: admin.id,
      studyGroupId: group1.id,
    },
    {
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
      uploaderId: admin.id,
      studyGroupId: group2.id,
    },
    {
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
      uploaderId: admin.id,
    },
    {
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
      uploaderId: admin.id,
    },
    {
      title: "Linear Algebra & Vector Spaces for Data Science",
      subject: "Mathematics",
      fileId: "1z2X3C4V5B6N7M8K9J0H1G2F3E4D5C6B",
      originalUrl: "https://drive.google.com/file/d/1z2X3C4V5B6N7M8K9J0H1G2F3E4D5C6B/view",
      description: "Eigenvalues, eigenvectors, Singular Value Decomposition (SVD), principal component analysis (PCA), and matrix transformations.",
      tag: "Mathematics",
      courseCode: "MATH-210",
      semester: "Spring 2026",
      upvotes: 31,
      ocrText: "Matrix decomposition A = U Sigma V^T. Eigenvalue equation A v = lambda v. Principal component projection orthogonal basis vectors.",
      uploaderId: admin.id,
    },
    {
      title: "Modern Microeconomics & Game Theory Models",
      subject: "Economics",
      fileId: "1a2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P",
      originalUrl: "https://drive.google.com/file/d/1a2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P/view",
      description: "Nash Equilibrium, Pareto efficiency, asymmetric information, Bertrand & Cournot oligopoly competition dynamics.",
      tag: "Economics",
      courseCode: "ECON-102",
      semester: "Fall 2026",
      upvotes: 11,
      ocrText: "Nash Equilibrium payoff matrix: Prisoner's Dilemma dominant strategies. Cournot duopoly quantity competition reaction functions.",
      uploaderId: admin.id,
    },
  ];

  const createdNotes = [];
  for (const noteData of sampleNotes) {
    const note = await prisma.note.create({ data: noteData });
    createdNotes.push(note);
  }

  // Add initial Q&A comments
  await prisma.comment.create({
    data: {
      noteId: createdNotes[0].id,
      userId: student.id,
      text: "Great summary of Shor's algorithm! The matrix derivation on slide 4 makes quantum Fourier transform super clear.",
    },
  });

  await prisma.comment.create({
    data: {
      noteId: createdNotes[0].id,
      userId: student2.id,
      text: "Pro tip: Check equation 3 for decoherence time formulas—it came up on last year's midterm!",
    },
  });

  await prisma.comment.create({
    data: {
      noteId: createdNotes[1].id,
      userId: student.id,
      text: "The self-attention multi-head breakdown is super helpful for our AI-401 term project.",
    },
  });

  console.log(`Seeded ${createdNotes.length} notes, 2 study groups, and comments.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
