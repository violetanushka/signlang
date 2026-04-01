const Course = require("../models/Course");
const Lesson = require("../models/Lesson");

const aslAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const aslDescriptions = {
  A: "Make a fist. Rest your thumb along the side of your index finger.",
  B: "Hold your open hand up, fingers together. Tuck your thumb across your palm.",
  C: "Curve all fingers and thumb to form a C shape, like gripping a cup.",
  D: "Touch your middle, ring, and pinky to your thumb. Point your index finger straight up.",
  E: "Curl all four fingers down. Tuck your thumb under the fingertips.",
  F: "Touch your index finger to your thumb to form a circle. Hold the other fingers up.",
  G: "Point your index finger and thumb horizontally to the side, other fingers folded.",
  H: "Extend your index and middle fingers together horizontally, pointing to the side.",
  I: "Make a fist and extend only your pinky finger straight up.",
  J: "Start with the I handshape, then trace a J shape in the air with your pinky.",
  K: "Hold up your index and middle fingers in a V shape, with your thumb resting between them.",
  L: "Extend your thumb and index finger to form an L shape. Other fingers folded.",
  M: "Tuck your thumb under your first three fingers (index, middle, ring).",
  N: "Tuck your thumb under your index and middle fingers only.",
  O: "Curve all fingers to touch your thumb, forming a round O shape.",
  P: "Like the K handshape, but rotated downward so the index finger points down.",
  Q: "Like the G handshape, but pointed downward toward the ground.",
  R: "Cross your index and middle fingers over each other.",
  S: "Make a fist with your thumb wrapped over the front of all your fingers.",
  T: "Make a fist. Then tuck your thumb between your index and middle finger.",
  U: "Hold your index and middle fingers straight up together. They should touch.",
  V: "Hold up your index and middle fingers in a V (peace sign), spread apart.",
  W: "Hold up your index, middle, and ring fingers spread apart, forming a W.",
  X: "Hold up your index finger and bend/hook it like a claw or question mark.",
  Y: "Extend your thumb and pinky finger outward. Keep the other fingers folded.",
  Z: "Point your index finger and trace the letter Z in the air.",
};

const intermediateLessons = [
  { value: "Hello", instructions: "Wave your open hand out from near your forehead." },
  { value: "Thank You", instructions: "Touch your chin with flat fingers, then move your hand forward." },
  { value: "Please", instructions: "Rub your flat hand in a circle on your chest." },
  { value: "Sorry", instructions: "Make a fist and rub it in a circle on your chest." },
  { value: "Yes", instructions: "Make a fist and nod it up and down like a nodding head." },
  { value: "No", instructions: "Snap your index and middle finger together with your thumb." },
  { value: "Help", instructions: "Place your fist on your open palm and lift both hands up." },
  { value: "I Love You", instructions: "Extend your thumb, index, and pinky — the ILY handshape." },
  { value: "Friend", instructions: "Hook your index fingers together, then swap their positions." },
  { value: "Family", instructions: "Make F handshapes with both hands and draw a full circle outward." },
];

module.exports = async function autoSeed() {
  try {
    const courseCount = await Course.countDocuments();
    if (courseCount > 0) {
      console.log("🗄️  Database already seeded — skipping auto-seed.");
      return;
    }

    console.log("\n📦  Empty database detected — running auto-seed...");

    // Beginner Course
    const beginnerCourse = await Course.create({
      title: "ASL Alphabet — Beginner",
      description:
        "Master the 26 letters of the American Sign Language alphabet. Each lesson has step-by-step emoji animations, webcam practice, and an AI-powered test.",
      level: "beginner",
      price: 0,
      color: "#10B981",
      totalLessons: 26,
      estimatedHours: 5,
      features: [
        "26 ASL letter signs",
        "Emoji-guided animations",
        "Webcam practice mode",
        "AI gesture testing",
        "Badges and points",
      ],
      order: 1,
    });

    // Intermediate Course
    const intermediateCourse = await Course.create({
      title: "ASL Common Phrases — Intermediate",
      description:
        "Learn essential everyday phrases in ASL. Practice greetings, emotions, and conversational signs with AI-guided webcam feedback.",
      level: "intermediate",
      price: 0,
      color: "#2563EB",
      totalLessons: 10,
      estimatedHours: 4,
      features: [
        "10 essential phrases",
        "Emoji step-by-step guide",
        "Webcam practice",
        "AI scoring",
        "Completion certificate",
      ],
      order: 2,
    });

    // Pro Course
    await Course.create({
      title: "ASL Fluency — Pro",
      description:
        "Achieve fluency in ASL with advanced expressions, context-based signs, and real-time conversation practice.",
      level: "pro",
      price: 4900,
      color: "#8B5CF6",
      totalLessons: 0,
      estimatedHours: 20,
      features: [
        "Advanced lessons (coming soon)",
        "Context-based signing",
        "Premium certification",
        "Priority support",
      ],
      order: 3,
    });

    // Beginner Lessons — ASL Alphabet A–Z
    const beginnerLessonDocs = aslAlphabet.map((letter, index) => ({
      courseId: beginnerCourse._id,
      title: `Letter ${letter}`,
      description: `Learn to sign the letter ${letter} in American Sign Language.`,
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
      assessmentConfig: {
        requiredAccuracy: 50,
        timeLimit: 30,
        attempts: 3,
      },
      pointsReward: 10,
    }));

    await Lesson.insertMany(beginnerLessonDocs);

    // Intermediate Lessons
    const intermediateLessonDocs = intermediateLessons.map((item, index) => ({
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
        altText: `Hand sign for: ${item.value}`,
      },
      assessmentConfig: {
        requiredAccuracy: 50,
        timeLimit: 45,
        attempts: 3,
      },
      pointsReward: 20,
    }));

    await Lesson.insertMany(intermediateLessonDocs);

    console.log("✅  Auto-seed complete!");
    console.log(`   → Beginner: ${aslAlphabet.length} lessons (A–Z)`);
    console.log(`   → Intermediate: ${intermediateLessons.length} lessons`);
    console.log("   → Pro: placeholder (coming soon)\n");
  } catch (err) {
    console.error("❌  Auto-seed error:", err.message);
  }
};
