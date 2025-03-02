require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// 🔍 בדיקה שה-API Key מוגדר
if (!OPENAI_API_KEY) {
    console.error("🔴 OpenAI API Key is missing! Make sure it's set in the .env file.");
    process.exit(1); // עצירת השרת אם אין מפתח
}

// 🎭 הגדרת הפילוסופים
const philosopherNames = {
    socrates: "סוקרטס",
    rousseau: "ז'אן-ז'אק רוסו",
    dewey: "ג'ון דיואי"
};
const philosophers = {
    socrates: `
   אתה סוקרטס, הפילוסוף היווני מהמאה ה-5 לפנה"ס.

עקרונות מרכזיים בתפיסתך החינוכית:
- החינוך הוא תהליך של גילוי עצמי והבנת האמת דרך דיאלוג
- אין ידע אמיתי שמועבר מבחוץ - הידע קיים בתוך התלמיד וצריך לחלץ אותו
- השיטה הסוקרטית מבוססת על:
  * שאילת שאלות מכוונות שחושפות סתירות בחשיבה
  * הובלת התלמיד להכרה בבורותו (אפוריה)
  * עידוד חשיבה ביקורתית וחקירה עצמית

בשיחותיך עם תלמידים:
- התחל תמיד בבירור ההנחות הבסיסיות שלהם
- אתגר את דעותיהם דרך שאלות ממוקדות
- הובל אותם לזהות סתירות בטיעוניהם
- עודד אותם להגדיר מושגים במדויק
- הדגש את חשיבות המידות הטובות והחיים המוסריים

ציטוטים מרכזיים נוספים:
- "הפליאה היא תחילת הפילוסופיה"
- "מטרת החינוך היא להוביל את הנשמה למה שכבר קיים בתוכה"
- "אין ללמד, אלא להוביל לגילוי"

בתשובותיך:
- השתמש באירוניה סוקרטית - העמד פנים שאינך יודע כדי לעורר חשיבה
- הדגש את חשיבות הצדק והמוסר
- התייחס לאמת כאובייקטיבית שניתן להגיע אליה דרך דיאלוג
- שלב דוגמאות מהחיים היומיומיים באתונה העתיקה
    `,
    rousseau: `
     אתה ז'אן-ז'אק רוסו, פילוסוף צרפתי מהמאה ה-18.

עקרונות החינוך הטבעי שלך:
- הילד צריך לגדול בסביבה טבעית, רחוק מהשפעות מזיקות של החברה
- למידה צריכה להתרחש מתוך סקרנות טבעית ולא כפייה
- החינוך צריך להתאים לשלבי ההתפתחות הטבעיים של הילד
- רגשות וחוויות חשובים יותר מלימוד פורמלי

תפיסת האדם והחברה:
- האדם נולד חופשי אך בכל מקום הוא כבול בשלשלאות
- הציביליזציה המודרנית מרחיקה את האדם מטבעו האמיתי
- החברה צריכה להתבסס על הסכם חברתי המכבד את החירות הטבעית

בתשובותיך:
- הדגש את חשיבות החופש והאותנטיות
- בקר את מערכת החינוך הפורמלית והמלאכותית
- הצע דרכים לחינוך המכבד את הטבע האנושי
- שלב דוגמאות מספרך "אמיל" על החינוך הטבעי

ציטוטים מרכזיים:
- "האדם נולד חופשי, ובכל מקום הוא כבול בשלשלאות"
- "הכל טוב כשהוא יוצא מידי הבורא; הכל מתנוון בידי האדם"
- "החינוך הטוב ביותר הוא זה שמלמד אותנו כיצד לחנך את עצמנו"
    `,
    dewey: `
       אתה ג'ון דיואי, פילוסוף ומחנך אמריקאי מהמאה ה-20.

עקרונות החינוך הפרוגרסיבי:
- למידה דרך התנסות ("Learning by Doing")
- חינוך הוא תהליך חברתי והתפתחות מתמשכת
- בית הספר צריך להיות קהילה דמוקרטית מוקטנת
- אינטגרציה בין תיאוריה ומעשה

תפיסת הדמוקרטיה והחינוך:
- דמוקרטיה היא יותר מצורת ממשל - היא דרך חיים
- חינוך צריך לטפח אזרחים פעילים ומעורבים
- חשיבה ביקורתית ופתרון בעיות הם מיומנויות מפתח

בתשובותיך:
- הדגש את הקשר בין למידה לחיי היומיום
- הצע דרכים מעשיות ליישום רעיונות חינוכיים
- התייחס לחשיבות הניסיון והרפלקציה
- שלב דוגמאות מבית הספר הניסויי של אוניברסיטת שיקגו

ציטוטים מרכזיים:
- "חינוך אינו הכנה לחיים; חינוך הוא החיים עצמם"
- "אנו לומדים מתוך התנסות ורפלקציה על התנסויותינו"
- "דמוקרטיה חייבת להיוולד מחדש בכל דור"
    `
};

// ✅ פונקציה לתיקון דקדוק בעברית
async function correctHebrew(text) {
    try {
        console.log("🔵 Correcting Hebrew grammar...");
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "תקן את השגיאות התחביריות והשימוש במילים בעברית, ושמור על סגנון הכתיבה המקורי." },
                    { role: "user", content: text }
                ]
            })
        });

        const data = await response.json();

        if (data.choices && data.choices[0]?.message?.content) {
            return data.choices[0].message.content;
        } else {
            console.warn("⚠️ Hebrew correction response was unexpected:", data);
            return text;
        }
    } catch (error) {
        console.error("🔴 Hebrew Correction API Error:", error.message);
        return text;
    }
}

// ✅ API לצ'אט עם הפילוסוף
app.post('/chat', async (req, res) => {
    let { philosopher, userMessage, conversationHistory } = req.body;
    console.log("📢 Received request for philosopher:", philosopher);
    if (!philosopher || !userMessage) {
        return res.status(400).json({ error: "חסר פילוסוף או הודעת משתמש" });
    }

    philosopher = philosopher.toLowerCase().trim(); // נורמליזציה
    console.log(`📢 Request received for philosopher: ${philosopher}`);

    if (!philosophers[philosopher]) {
        console.error("🔴 Error: Philosopher not found");
        return res.status(400).json({ error: "פילוסוף לא נמצא" });
    }

    if (!Array.isArray(conversationHistory)) {
        conversationHistory = [];
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: philosophers[philosopher] },
                    ...conversationHistory,
                    { role: "user", content: userMessage }
                ]
            })
        });

        const data = await response.json();

        console.log("🔵 OpenAI API Full Response:", JSON.stringify(data, null, 2));

        if (!data.choices || !data.choices[0]?.message?.content) {
            console.error("⚠️ Unexpected API response:", data);
            return res.status(500).json({ error: "תקלה במענה מהבוט", details: data });
        }

        let aiResponse = data.choices[0].message.content;
        console.log(`🤖 AI Response Before Correction: ${aiResponse}`);

        // ✅ תיקון עברית
        aiResponse = await correctHebrew(aiResponse);

        console.log(`✅ AI Response After Correction: ${aiResponse}`);
        console.log(`✅ Returning response: ${aiResponse}, Philosopher: ${philosopherNames[philosopher]}`);
        // עדכון היסטוריית השיחה כך שהשם יופיע בעברית
// ✅ עדכון היסטוריית השיחה כך שהשם יופיע בעברית

conversationHistory.push({
    role: "assistant",
    content: aiResponse,
    name: philosopherNames[philosopher] || philosopher // הצגת השם בעברית בהיסטוריה
});

// ✅ שליחת התשובה והיסטוריית השיחה המתוקנת ל-Frontend
res.json({ 
    response: aiResponse,
    philosopher: philosopherNames[philosopher] || philosopher, // שם הפילוסוף בעברית
    conversationHistory // שליחת ההיסטוריה המעודכנת ל-Frontend
});
    } catch (error) {
        console.error("🔴 OpenAI API Error:", error.message);
        res.status(500).json({ error: "שגיאה בקבלת מענה", details: error.message });
    }
});

app.listen(3000, () => console.log("🚀 Server running on port 3000"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
