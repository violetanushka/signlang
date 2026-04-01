const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");

dotenv.config();

const aslAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const aslDescriptions = {
  A: "Make a fist with your thumb resting on the side of your index finger.",
  B: "Hold your hand up with fingers together and straight, thumb tucked across palm.",
  C: "Curve your hand into a C shape, like holding a cup.",
  D: "Touch your thumb to your middle, ring, and pinky fingers. Point index finger up.",
  E: "Curl all fingers down with thumb tucked under the fingertips.",
  F: "Touch your index finger and thumb together in a circle. Other fingers spread up.",
  G: "Point index finger and thumb horizontally, like a gun shape turned sideways.",
  H: "Extend your index and middle fingers together horizontally.",
  I: "Make a fist and extend your pinky finger straight up.",
  J: "Start with I handshape, then trace a J motion with your pinky.",
  K: "Hold up index and middle fingers in a V, with thumb touching middle finger.",
  L: "Extend thumb and index finger to form an L shape.",
  M: "Tuck your thumb under your index, middle, and ring fingers over the thumb.",
  N: "Tuck your thumb under your index and middle fingers.",
  O: "Curve all fingers to touch your thumb, forming an O shape.",
  P: "Like K handshape but pointed downward.",
  Q: "Like G handshape but pointed downward.",
  R: "Cross your index and middle fingers.",
  S: "Make a fist with your thumb wrapped over your fingers.",
  T: "Tuck your thumb between your index and middle fingers.",
  U: "Hold up your index and middle fingers together, straight up.",
  V: "Make a peace/victory sign with index and middle fingers spread.",
  W: "Hold up index, middle, and ring fingers spread apart.",
  X: "Hook your index finger into a curved shape, like a hook.",
  Y: "Extend your thumb and pinky finger, other fingers folded.",
  Z: "Trace the letter Z in the air with your index finger.",
};

const seedData = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/signa";
    await mongoose.connect(uri);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data
    await Course.deleteMany({});
    await Lesson.deleteMany({});

    // Create Beginner Course
    const beginnerCourse = await Course.create({
      title: "ASL Alphabet — Beginner",
      description:
        "Master the 26 letters of the American Sign Language (ASL) alphabet. Each letter comes with animated demonstrations, practice exercises, and AI-powered feedback.",
      level: "beginner",
      price: 0,
      color: "#10B981",
      totalLessons: 26,
      estimatedHours: 5,
      features: [
        "26 ASL letter signs",
        "Animated hand demonstrations",
        "AI webcam practice",
        "Real-time accuracy feedback",
        "Earn badges and points",
      ],
      order: 1,
    });

    // Create Intermediate Course
    const intermediateCourse = await Course.create({
      title: "ASL Common Phrases — Intermediate",
      description:
        "Learn essential everyday phrases in ASL. Practice greetings, questions, emotions, and common conversations with AI-guided feedback.",
      level: "intermediate",
      price: 2900,
      color: "#2563EB",
      totalLessons: 20,
      estimatedHours: 10,
      features: [
        "20 essential phrases",
        "Conversation practice",
        "Speed challenges",
        "Detailed feedback",
        "Completion certificate",
      ],
      order: 2,
    });

    // Create Pro Course
    const proCourse = await Course.create({
      title: "ASL Fluency — Pro",
      description:
        "Achieve fluency in ASL with advanced expressions, context-dependent signs, and real-time conversation practice.",
      level: "pro",
      price: 4900,
      color: "#8B5CF6",
      totalLessons: 30,
      estimatedHours: 20,
      features: [
        "30 advanced lessons",
        "Context-based signing",
        "Real-time translation",
        "Premium certification",
        "Priority support",
      ],
      order: 3,
    });

    // Create Beginner Lessons (ASL Alphabet)
    const lessons = aslAlphabet.map((letter, index) => ({
      courseId: beginnerCourse._id,
      title: `Letter ${letter}`,
      description: `Learn to sign the letter ${letter} in ASL.`,
      order: index + 1,
      content: {
        type: "letter",
        value: letter,
        instructions: aslDescriptions[letter],
        subtitles: `This is the ASL sign for the letter ${letter}. ${aslDescriptions[letter]}`,
      },
      gestureData: {
        altText: `Hand demonstration for ASL letter ${letter}`,
      },
      referenceImages: [],
      assessmentConfig: {
        requiredAccuracy: 70,
        timeLimit: 30,
        attempts: 3,
      },
      pointsReward: 10,
    }));

    await Lesson.insertMany(lessons);

    // Create a few intermediate lessons (placeholder)
    const intermediateLessons = [
      { value: "Hello", instructions: "Wave your open hand near your forehead outward." },
      { value: "Thank You", instructions: "Touch your chin with your fingertips and move your hand forward." },
      { value: "Please", instructions: "Rub your flat hand in a circle on your chest." },
      { value: "Sorry", instructions: "Make a fist and rub it in a circle on your chest." },
      { value: "Yes", instructions: "Make a fist and nod it up and down, like a nodding head." },
      { value: "No", instructions: "Snap your index and middle finger together with your thumb." },
      { value: "Help", instructions: "Place your fist on your open palm and raise both hands together." },
      { value: "I Love You", instructions: "Extend your thumb, index finger, and pinky. ILY handshape." },
      { value: "Friend", instructions: "Hook your index fingers together, then switch positions." },
      { value: "Family", instructions: "Make F handshapes with both hands and draw a circle." },
    ].map((item, index) => ({
      courseId: intermediateCourse._id,
      title: item.value,
      description: `Learn to sign "${item.value}" in ASL.`,
      order: index + 1,
      content: {
        type: "phrase",
        value: item.value,
        instructions: item.instructions,
        subtitles: `This is the ASL sign for "${item.value}". ${item.instructions}`,
      },
      gestureData: {
        altText: `Hand demonstration for ASL phrase: ${item.value}`,
      },
      assessmentConfig: {
        requiredAccuracy: 70,
        timeLimit: 45,
        attempts: 3,
      },
      pointsReward: 20,
    }));

    await Lesson.insertMany(intermediateLessons);

    console.log("\n✅ Seed data created successfully!");
    console.log(`   → Beginner course: ${beginnerCourse.title} (${aslAlphabet.length} lessons)`);
    console.log(`   → Intermediate course: ${intermediateCourse.title} (${intermediateLessons.length} lessons)`);
    console.log(`   → Pro course: ${proCourse.title} (placeholder)\n`);

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedData();
