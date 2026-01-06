import React, { useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { 
  Brain, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  ArrowRight, 
  BookOpen, 
  Layers, 
  Repeat, 
  ShieldAlert
} from 'lucide-react';
import './App.css';

const FLASHCARDS = [
  { title: "Curry-Howard", content: "Preuve = Programme. Formule = Type. Si ton programme compile, le théorème est vrai." },
  { title: "Prop vs Bool", content: "Attention ! `Prop` est logique (indécidable). `bool` est une donnée (calculable, true/false). On ne fait pas de `if` sur une `Prop`." },
  { title: "Terminaison", content: "Dans Coq (Gallina), toutes les fonctions doivent terminer. Pas de boucles infinies, sinon on pourrait prouver False (incohérence)." },
  { title: "Intro vs Intros", content: "`intro` consomme une hypothèse/quantificateur. `intros` en consomme plusieurs d'un coup." },
  { title: "Destruct", content: "Sert à faire une analyse par cas sur une HYPOTHÈSE. Sur un `nat` (0/S n), ou un `ou` (A \\/ B)." },
  { title: "Split", content: "Utilisé pour prouver une conjonction `A /\\ B` (ET). Génère deux sous-buts : prouver A, puis prouver B." },
  { title: "Apply", content: "Utilise une implication `H: A -> B`. Si le but est B, `apply H` transforme le but en A (Backward chaining)." },
  { title: "Rewrite", content: "Utilise une égalité `H: x = y`. `rewrite H` remplace x par y dans le but. `rewrite <- H` remplace y par x." },
  { title: "Fixpoint", content: "Mot-clé pour définir une fonction récursive. Doit avoir un argument qui décroît structurellement." },
  { title: "Induction", content: "Génère une Hypothèse d'Induction (IH) pour le cas récursif. Crucial pour `nat` et `list`." },
  { title: "Discriminate", content: "Prouve l'absurde si une égalité compare deux constructeurs différents (ex: 0 = S n)." },
  { title: "Injection", content: "Déduit l'égalité des arguments si les constructeurs sont égaux (ex: S n = S m -> n = m)." }
];

const CORE_QUESTIONS = [
  {
    level: 'Facile',
    question: "Ton but est `A -> B`. Quelle tactique utilises-tu pour déplacer A dans les hypothèses ?",
    context: "Goal: A -> B",
    answers: [
      { text: "intro", correct: true, feedback: "Correct. `intro` déplace l'antécédent vers le contexte." },
      { text: "apply", correct: false, feedback: "`apply` s'utilise quand tu as déjà une règle qui conclut B." },
      { text: "destruct", correct: false, feedback: "`destruct` sert à casser une structure existante, pas à introduire." },
      { text: "split", correct: false, feedback: "`split` est pour le ET (/\\), pas l'implication." }
    ]
  },
  {
    level: 'Facile',
    question: "Quel connecteur correspond à la disjonction (OU) ?",
    context: "Logique Propositionnelle",
    answers: [
      { text: "\\/", correct: true, feedback: "Oui, le V logique." },
      { text: "/\\", correct: false, feedback: "Non, ça c'est le ET (chapeau)." },
      { text: "<->", correct: false, feedback: "C'est l'équivalence." },
      { text: "=>", correct: false, feedback: "C'est pour le pattern matching." }
    ]
  },
  {
    level: 'Facile',
    question: "Quelle commande donne le type d'un terme ?",
    context: "Coq IDE",
    answers: [
      { text: "Check", correct: true, feedback: "Check affiche le type dans la fenêtre de réponse." },
      { text: "Print", correct: false, feedback: "Print affiche la définition (le corps)." },
      { text: "Show", correct: false, feedback: "Show affiche l'état de la preuve." },
      { text: "Eval", correct: false, feedback: "Eval calcule la valeur." }
    ]
  },
  {
    level: 'Facile',
    question: "Ton but est `A /\\ B`. Tu tapes :",
    context: "Goal: A /\\ B",
    answers: [
      { text: "split", correct: true, feedback: "Divise en 2 sous-buts : A et B." },
      { text: "destruct", correct: false, feedback: "Destruct s'utilise sur une HYPOTHÈSE `H: A /\\ B`." },
      { text: "left", correct: false, feedback: "Left est pour le OU (\\/)." },
      { text: "intro", correct: false, feedback: "Inutile ici." }
    ]
  },
  {
    level: 'Moyen',
    question: "Tu as `H: A \\/ B`. Tu veux faire une disjonction de cas.",
    context: "Hypothesis H : A \\/ B",
    answers: [
      { text: "destruct H", correct: true, feedback: "Crée deux sous-preuves : une avec A, une avec B." },
      { text: "left", correct: false, feedback: "Left s'utilise sur le BUT, pas l'hypothèse." },
      { text: "split H", correct: false, feedback: "Split ne marche pas sur un OU." },
      { text: "induction H", correct: false, feedback: "Trop puissant, destruct suffit ici." }
    ]
  },
  {
    level: 'Moyen',
    question: "Tu veux prouver `exists x, x = 0`. Tu choisis 0 comme témoin.",
    context: "Goal: exists x, x = 0",
    answers: [
      { text: "exists 0", correct: true, feedback: "Fournit le témoin explicite." },
      { text: "apply 0", correct: false, feedback: "Apply attend une preuve/lemme, pas une valeur." },
      { text: "witness 0", correct: false, feedback: "Commande inexistante." },
      { text: "destruct 0", correct: false, feedback: "Absurde sur une valeur." }
    ]
  },
  {
    level: 'Moyen',
    question: "Tu as `H: x = y`. Ton but est `f x = f y`. Quelle est la plus simple ?",
    context: "H: x = y\nGoal: f x = f y",
    answers: [
      { text: "rewrite H", correct: true, feedback: "Remplace x par y, le but devient f y = f y (reflexivity)." },
      { text: "apply H", correct: false, feedback: "H n'est pas une implication." },
      { text: "injection H", correct: false, feedback: "Injection déduit x=y depuis f x = f y (l'inverse)." },
      { text: "inversion H", correct: false, feedback: "Trop lourd pour une simple réécriture." }
    ]
  },
  {
    level: 'Moyen',
    question: "Quelle tactique résout immédiatement `Goal: x = x` ?",
    context: "",
    answers: [
      { text: "reflexivity", correct: true, feedback: "L'égalité est réflexive." },
      { text: "symmetry", correct: false, feedback: "Change x=y en y=x." },
      { text: "simpl", correct: false, feedback: "Simplifie le terme mais ne conclut pas toujours." },
      { text: "assumption", correct: false, feedback: "Seulement si `x=x` est déjà dans les hypothèses." }
    ]
  },
  {
    level: 'Moyen',
    question: "Tu veux prouver `forall n:nat, n + 0 = n`. `simpl` ne marche pas. Pourquoi ?",
    context: "Fixpoint add n m := match n with 0 => m | S p => S (add p m) end.",
    answers: [
      { text: "Il faut une induction sur n", correct: true, feedback: "La définition matche sur le 1er argument. Ici n est inconnu." },
      { text: "Il faut destruct n", correct: false, feedback: "Insuffisant (manque l'hypothèse de récurrence)." },
      { text: "Il faut faire reflexivity", correct: false, feedback: "n+0 n'est pas définitionnellement égal à n." },
      { text: "Il faut utiliser ring", correct: false, feedback: "Possible, mais induction est la réponse fondamentale." }
    ]
  },
  {
    level: 'Difficile',
    question: "Tu as `H: S n = S m`. Tu veux obtenir `n = m`.",
    context: "Hypothesis H : S n = S m",
    answers: [
      { text: "injection H", correct: true, feedback: "Utilise l'injectivité des constructeurs." },
      { text: "discriminate H", correct: false, feedback: "Discriminate sert si les constructeurs sont DIFFÉRENTS." },
      { text: "rewrite H", correct: false, feedback: "Tente de remplacer S n par S m." },
      { text: "simpl H", correct: false, feedback: "Ne simplifie pas l'égalité logique." }
    ]
  },
  {
    level: 'Difficile',
    question: "Tu as `H: 0 = 1`. Comment finir la preuve ?",
    context: "Hypothesis H : 0 = 1\nGoal: False",
    answers: [
      { text: "discriminate H", correct: true, feedback: "0 et S (de 0) sont distincts. C'est absurde." },
      { text: "injection H", correct: false, feedback: "Pas d'arguments à injecter." },
      { text: "reflexivity", correct: false, feedback: "0 n'est pas égal à 1." },
      { text: "rewrite H", correct: false, feedback: "Remplacerait 0 par 1, mais ne résout pas le but directement." }
    ]
  },
  {
    level: 'Difficile',
    question: "Dans une `induction n`, à quoi correspond le contexte du cas `S n` ?",
    context: "Goal: P(n)",
    answers: [
      { text: "n: nat, IHn: P(n)", correct: true, feedback: "L'hypothèse d'induction (IHn) : on suppose P vrai pour n." },
      { text: "n: nat", correct: false, feedback: "C'est un simple destruct s'il n'y a pas IHn." },
      { text: "S n: nat, IH: P(S n)", correct: false, feedback: "Syntaxe incorrecte et logique circulaire." },
      { text: "n: nat, H: P(0)", correct: false, feedback: "P(0) est le cas de base." }
    ]
  },
  {
    level: 'Difficile',
    question: "Si j'ai `Goal: A \\/ B` et je veux prouver B. Je tape :",
    context: "Goal: A \\/ B",
    answers: [
      { text: "right", correct: true, feedback: "Sélectionne le membre droit." },
      { text: "left", correct: false, feedback: "Sélectionne A." },
      { text: "destruct", correct: false, feedback: "S'utilise sur une hypothèse." },
      { text: "exists B", correct: false, feedback: "Exists est pour les quantificateurs." }
    ]
  },
  {
    level: 'Difficile',
    question: "Quelle tactique permet de définir un sous-but intermédiaire ?",
    context: "",
    answers: [
      { text: "assert (H: ...)", correct: true, feedback: "Ouvre une parenthèse de preuve (coupure)." },
      { text: "pose (H := ...)", correct: false, feedback: "Pose définit un terme, pas une preuve à faire." },
      { text: "admit", correct: false, feedback: "Admit abandonne la preuve." },
      { text: "check", correct: false, feedback: "Juste pour vérifier un type." }
    ]
  },
  {
    level: 'Difficile',
    question: "`repeat` est une tactique qui :",
    context: "repeat rewrite H",
    answers: [
      { text: "Applique la tactique tant qu'elle réussit", correct: true, feedback: "Attention aux boucles infinies !" },
      { text: "Répète la tactique 2 fois", correct: false, feedback: "Non, c'est indéfini." },
      { text: "Applique sur tous les sous-buts", correct: false, feedback: "Ça c'est `all:` ou `;`." },
      { text: "Annule la dernière action", correct: false, feedback: "Ça c'est `Undo`." }
    ]
  },
  {
    level: 'Difficile',
    question: "Quelle est la différence entre `apply` et `exact` ?",
    context: "",
    answers: [
      { text: "exact échoue si le terme n'est pas strictement identique (unification faible)", correct: true, feedback: "apply est plus intelligent sur l'unification." },
      { text: "apply termine toujours la preuve", correct: false, feedback: "Non, apply peut laisser des sous-buts." },
      { text: "exact ne marche que sur des égalités", correct: false, feedback: "Faux." },
      { text: "Il n'y en a pas", correct: false, feedback: "Si, exact est plus strict." }
    ]
  },
  {
    level: 'Difficile',
    question: "Le théorème de Rice implique que :",
    context: "Méthodes Formelles",
    answers: [
      { text: "Toute propriété sémantique non triviale est indécidable", correct: true, feedback: "On ne peut pas tout automatiser." },
      { text: "L'arrêt d'un programme est décidable", correct: false, feedback: "C'est l'inverse." },
      { text: "Il est impossible de prouver un programme", correct: false, feedback: "Faux, on peut prouver, mais pas décider automatiquement." },
      { text: "Les tests suffisent", correct: false, feedback: "Non." }
    ]
  }
];

const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

const generateQuestionBank = (count) => {
  let questions = [...CORE_QUESTIONS];
  
  if (count > CORE_QUESTIONS.length) {
    const variations = [
      { q: "Quel est le type de `nat` ?", a: "Set", bad: ["Prop", "Type", "bool"] },
      { q: "Quel est le type de `list` ?", a: "Type -> Type", bad: ["Type", "Set", "Prop"] },
      { q: "Comment prouver `True` ?", a: "exact I", bad: ["reflexivity", "split", "intro"] },
      { q: "Comment prouver `False` ?", a: "impossible (sauf contexte contradictoire)", bad: ["exact I", "split", "exists"] },
      { q: "Le type `option A` a combien de constructeurs ?", a: "2 (Some et None)", bad: ["1", "3", "Infini"] },
      { q: "`A -> B` est équivalent à :", a: "forall (_:A), B", bad: ["exists (_:A), B", "A /\\ B", "A \\/ B"] },
      { q: "Pour utiliser le lemme `add_comm : n + m = m + n`", a: "rewrite add_comm", bad: ["apply add_comm", "destruct add_comm", "induction add_comm"] }
    ];

    let i = 0;
    while (questions.length < count) {
      const template = variations[i % variations.length];
      questions.push({
        id: `gen_${questions.length}`,
        level: i % 2 === 0 ? 'Facile' : 'Moyen',
        question: template.q,
        context: "Variation Générée",
        answers: shuffle([
            { text: template.a, correct: true, feedback: "C'est la définition." },
            { text: Array.isArray(template.bad) ? template.bad[0] : template.bad, correct: false, feedback: "Non." },
            { text: Array.isArray(template.bad) ? template.bad[1] : "Autre", correct: false, feedback: "Incorrect." },
            { text: Array.isArray(template.bad) ? template.bad[2] : "Absurde", correct: false, feedback: "Faux." }
        ])
      });
      i++;
    }
  }

  return shuffle(questions).slice(0, count).map(q => ({
    ...q,
    answers: shuffle(q.answers)
  }));
};

function Menu({ onStart }) {
  return (
    <div className="menu-container">
      <div className="menu-header">
        <h2 className="menu-title">Prêt à Prouver ?</h2>
        <p className="menu-subtitle">
          Révise tes tactiques, maîtrise la logique et domine l'examen. 
          Choisis ton intensité.
        </p>
      </div>

      <div className="menu-buttons">
        {[10, 20, 50].map(count => (
          <button 
            key={count}
            onClick={() => onStart(count)}
            className="menu-btn"
          >
            <div className="menu-btn-count">{count}</div>
            <div className="menu-btn-label">Questions</div>
          </button>
        ))}
      </div>

      <button 
        onClick={() => onStart(100)}
        className="warrior-btn"
      >
        <ShieldAlert size={24} />
        Mode Guerrier (100 Questions)
      </button>
    </div>
  );
}

function GameCard({ data, onAnswer, onNext }) {
  const [status, setStatus] = useState('waiting');
  const [selectedIndex, setSelectedIndex] = useState(null);

  const handleChoice = (index, isCorrect) => {
    if (status !== 'waiting') return;
    setSelectedIndex(index);
    setStatus(isCorrect ? 'correct' : 'wrong');
    onAnswer(isCorrect);
  };

  const levelColors = {
    'Facile': 'level-easy',
    'Moyen': 'level-medium',
    'Difficile': 'level-hard'
  };

  const renderQuestion = (text) => {
    return text.split('`').map((part, i) => 
      i % 2 === 1 
        ? <code key={i} className="inline-code">{part}</code> 
        : part
    );
  };

  return (
    <div className="game-card">
      <div className="progress-line">
        <div className={`progress-fill ${status !== 'waiting' ? 'filled' : ''} ${status === 'correct' ? 'correct' : 'wrong'}`}></div>
      </div>

      <div className="card-content">
        <div className="card-header">
          <span className={`level-badge ${levelColors[data.level]}`}>
            {data.level}
          </span>
        </div>

        <h3 className="question-text">
          {renderQuestion(data.question)}
        </h3>

        {data.context && (
          <div className="context-block">
            <pre>{data.context}</pre>
          </div>
        )}

        <div className="answers-grid">
          {data.answers.map((ans, idx) => {
            let stateClass = "answer-default";
            if (status !== 'waiting') {
              if (ans.correct) stateClass = "answer-correct";
              else if (idx === selectedIndex) stateClass = "answer-wrong";
              else stateClass = "answer-disabled";
            }

            return (
              <button 
                key={idx}
                onClick={() => handleChoice(idx, ans.correct)}
                disabled={status !== 'waiting'}
                className={`answer-btn ${stateClass}`}
              >
                <span>{ans.text}</span>
                {status !== 'waiting' && ans.correct && <CheckCircle2 className="icon-correct" />}
                {status !== 'waiting' && idx === selectedIndex && !ans.correct && <XCircle className="icon-wrong" />}
              </button>
            );
          })}
        </div>

        {status !== 'waiting' && (
          <div className="feedback-section">
            <div className={`feedback-box ${status === 'correct' ? 'feedback-correct' : 'feedback-wrong'}`}>
              <div className="feedback-label">
                {status === 'correct' ? <span className="text-correct">Explication</span> : <span className="text-wrong">Analyse de l'erreur</span>}
              </div>
              <p className="feedback-text">
                {data.answers[selectedIndex].feedback}
              </p>
              {status === 'wrong' && (
                <div className="solution-hint">
                  💡 Solution : {data.answers.find(a => a.correct).feedback}
                </div>
              )}
            </div>

            <button onClick={onNext} className="next-btn">
              Question Suivante <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FlashCard({ card, onNext }) {
  const renderContent = (text) => {
    return text.split('`').map((part, i) => 
      i % 2 === 1 
        ? <code key={i} className="flash-code">{part}</code> 
        : part
    );
  };

  return (
    <div className="flashcard-outer">
      <div className="flashcard-inner">
        <div className="flashcard-glow"></div>

        <div className="flashcard-icon">
          <BookOpen size={48} />
        </div>

        <h2 className="flashcard-label">Instant Flash Card</h2>
        <h3 className="flashcard-title">{card.title}</h3>

        <div className="flashcard-content">
          <p>{renderContent(card.content)}</p>
        </div>

        <button onClick={onNext} className="flashcard-btn">
          <CheckCircle2 size={20} />
          J'ai mémorisé
        </button>
      </div>
    </div>
  );
}

function EndScreen({ score, total, onRestart }) {
  const percentage = Math.round((score / total) * 100);
  let message = "";
  let subMessage = "";
  
  if (percentage === 100) { message = "Légende Absolue 👑"; subMessage = "Les tactiques n'ont plus de secret pour toi."; }
  else if (percentage >= 80) { message = "Expert en Preuve 🧠"; subMessage = "Très solide. L'examen sera une formalité."; }
  else if (percentage >= 50) { message = "Pas mal ! 🎓"; subMessage = "Les bases sont là, attention aux pièges."; }
  else { message = "Retourne au TP1 📚"; subMessage = "Relis la cheat sheet et recommence."; }

  const circumference = 2 * Math.PI * 88;
  const strokeOffset = circumference - (circumference * percentage) / 100;

  return (
    <div className="end-screen">
      <div className="score-circle-container">
        <svg className="score-circle" viewBox="0 0 192 192">
          <circle cx="96" cy="96" r="88" className="circle-bg" />
          <circle 
            cx="96" cy="96" r="88" 
            className={`circle-progress ${percentage >= 50 ? 'success' : 'fail'}`}
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
          />
        </svg>
        <div className="score-text">
          <span className="score-percent">{percentage}%</span>
          <span className="score-label">Précision</span>
        </div>
      </div>
      
      <h2 className="end-message">{message}</h2>
      <p className="end-submessage">{subMessage}</p>
      
      <button onClick={onRestart} className="restart-btn">
        <Repeat size={20} /> Menu Principal
      </button>
    </div>
  );
}

export default function App() {
  const [gameState, setGameState] = useState('menu');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showFlashcard, setShowFlashcard] = useState(false);
  const [flashcardContent, setFlashcardContent] = useState(null);

  const startGame = (count) => {
    const generated = generateQuestionBank(count);
    setQuestions(generated);
    setScore(0);
    setStreak(0);
    setCurrentIndex(0);
    setGameState('playing');
  };

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
  };

  const nextStep = () => {
    if (!showFlashcard && (currentIndex + 1) % 5 === 0 && currentIndex < questions.length - 1) {
      setFlashcardContent(FLASHCARDS[Math.floor(Math.random() * FLASHCARDS.length)]);
      setShowFlashcard(true);
    } else {
      setShowFlashcard(false);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(c => c + 1);
      } else {
        setGameState('end');
      }
    }
  };

  return (
    <div className="app-container">
      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>

      <div className="main-content">
        <header className="header">
          <div className="logo">
            <div className="logo-icon">
              <Brain size={28} />
            </div>
            <div>
              <h1 className="logo-title">CoqMaster</h1>
              <span className="logo-subtitle">Ultimate Edition</span>
            </div>
          </div>
          
          {gameState === 'playing' && (
            <div className="stats">
              <div className="stat stat-score">
                <Trophy size={16} /> {score}
              </div>
              <div className="stat stat-streak">
                <Zap size={16} /> {streak}
              </div>
              <div className="stat stat-progress">
                <Layers size={16} /> {currentIndex + 1}/{questions.length}
              </div>
            </div>
          )}
        </header>

        <main className="content-area">
          {gameState === 'menu' && <Menu onStart={startGame} />}
          
          {gameState === 'playing' && (
            showFlashcard 
              ? <FlashCard card={flashcardContent} onNext={nextStep} />
              : <GameCard 
                  key={currentIndex} 
                  data={questions[currentIndex]} 
                  onAnswer={handleAnswer} 
                  onNext={nextStep} 
                />
          )}

          {gameState === 'end' && (
            <EndScreen 
              score={score} 
              total={questions.length} 
              onRestart={() => setGameState('menu')} 
            />
          )}
        </main>
        <Analytics />
      </div>
    </div>
  );
}
