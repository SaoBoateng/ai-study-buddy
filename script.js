(() => {
	// Elements
	const setup = document.getElementById('setup-screen');
	const quiz = document.getElementById('quiz-screen');
	const startBtn = document.getElementById('startBtn');
	const topicInput = document.getElementById('topic');
	const numInput = document.getElementById('numQuestions');
	const difficultyRadios = document.getElementsByName('difficulty');

	const progressEl = document.getElementById('progress');
	const scoreEl = document.getElementById('score');
	const questionText = document.getElementById('questionText');
	const choicesList = document.getElementById('choices');
	const feedbackEl = document.getElementById('feedback');
	const showAnswerBtn = document.getElementById('showAnswerBtn');
	const nextBtn = document.getElementById('nextBtn');
	const endScreen = document.getElementById('end-screen');
	const finalScore = document.getElementById('finalScore');
	const restartBtn = document.getElementById('restartBtn');

	let questions = [];
	let current = 0;
	let score = 0;
	let answered = false;

	function getDifficulty(){
		for(const r of difficultyRadios) if(r.checked) return r.value;
		return 'medium';
	}

	function shuffle(a){
		for(let i=a.length-1;i>0;i--){
			const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]
		}
		return a;
	}

	// Fallback placeholder generator (kept for offline/dev)
	function generateQuestionsPlaceholder(topic, difficulty, n){
		const qs = [];
		for(let i=0;i<n;i++){
			const idx = i+1;
			const text = `${topic || 'General'} — ${difficulty} question ${idx}: Which option is correct?`;
			const correct = `Correct answer ${idx}`;
			const wrongs = [`Wrong A ${idx}`,'Wrong B '+idx,'Wrong C '+idx];
			const choices = shuffle([correct, ...wrongs]);
			qs.push({text, choices, correct});
		}
		return qs;
	}

	// Call the local proxy that forwards to OpenAI. Expects backend at /api/generate
	async function fetchQuestionsFromServer(topic, difficulty, n){
		try{
			// the server expects a field named `count` (not numQuestions)
			const resp = await fetch('/api/generate', {
				method: 'POST',
				headers: {'Content-Type':'application/json'},
				body: JSON.stringify({topic, difficulty, count: n})
			});
			if(!resp.ok) throw new Error(`Server error ${resp.status}`);
			const data = await resp.json();
			if(Array.isArray(data.questions)) return data.questions.map(q=>({
				text: q.question || q.text || q.q,
				choices: q.choices || q.options || q.choices_list || [],
				correct: q.answer || q.correct || q.answer_text
			}));
			throw new Error('Invalid response format from server');
		}catch(err){
			console.warn('Fetch questions failed, using placeholder:', err);
			return generateQuestionsPlaceholder(topic,difficulty,n);
		}
	}

	async function startQuiz(){
		const topic = topicInput.value.trim() || 'General';
		const difficulty = getDifficulty();
		let n = parseInt(numInput.value,10) || 5; if(n<1) n=1; if(n>10) n=10;
		// Try server-backed generation first
		questions = await fetchQuestionsFromServer(topic, difficulty, n);
		current = 0; score = 0; answered = false;
		setup.classList.add('hidden');
		quiz.classList.remove('hidden');
		endScreen.classList.add('hidden');
		renderQuestion();
	}

	function renderQuestion(){
		const q = questions[current];
		progressEl.textContent = `Question ${current+1} / ${questions.length}`;
		scoreEl.textContent = `Score: ${score}`;
		questionText.textContent = q.text;
		choicesList.innerHTML = '';
		feedbackEl.textContent = '';
		answered = false;
		nextBtn.disabled = true;

		q.choices.forEach((c, idx) => {
			const li = document.createElement('li');
			li.tabIndex = 0;
			li.textContent = c;
			li.dataset.choice = c;
			li.addEventListener('click', onChoice);
			li.addEventListener('keydown', (e)=>{ if(e.key==='Enter') onChoice.call(li,e)});
			choicesList.appendChild(li);
		});
	}

	function onChoice(e){
		if(answered) return;
		const chosen = this.dataset.choice || e.currentTarget.dataset.choice;
		const q = questions[current];
		const items = Array.from(choicesList.children);
		items.forEach(it=>{ it.classList.remove('correct','wrong'); it.style.pointerEvents='none'; });
		if(chosen === q.correct){
			// correct
			const li = items.find(it=>it.dataset.choice===chosen);
			if(li) li.classList.add('correct');
			feedbackEl.textContent = 'Correct!';
			score += 1;
			scoreEl.textContent = `Score: ${score}`;
		} else {
			const liWrong = items.find(it=>it.dataset.choice===chosen);
			if(liWrong) liWrong.classList.add('wrong');
			const liCorrect = items.find(it=>it.dataset.choice===q.correct);
			if(liCorrect) liCorrect.classList.add('correct');
			feedbackEl.textContent = 'Incorrect.';
		}
		answered = true;
		nextBtn.disabled = false;
	}

	function showAnswer(){
		const q = questions[current];
		const items = Array.from(choicesList.children);
		items.forEach(it=>{ it.style.pointerEvents='none'; if(it.dataset.choice===q.correct) it.classList.add('correct'); });
		feedbackEl.textContent = `Answer: ${q.correct}`;
		answered = true;
		nextBtn.disabled = false;
	}

	function nextQuestion(){
		current += 1;
		if(current >= questions.length){
			endQuiz();
			return;
		}
		renderQuestion();
	}

	function endQuiz(){
		// Hide quiz content and show end
		questionText.textContent = '';
		choicesList.innerHTML = '';
		feedbackEl.textContent = '';
		endScreen.classList.remove('hidden');
		finalScore.textContent = `You scored ${score} out of ${questions.length}.`;
		nextBtn.disabled = true;
	}

	function restart(){
		setup.classList.remove('hidden');
		quiz.classList.add('hidden');
		endScreen.classList.add('hidden');
	}

	// Wire events
	startBtn.addEventListener('click', startQuiz);
	showAnswerBtn.addEventListener('click', showAnswer);
	nextBtn.addEventListener('click', nextQuestion);
	restartBtn.addEventListener('click', restart);

	// keyboard: allow space/enter on next
	document.addEventListener('keydown', (e)=>{
		if(e.key==='ArrowRight' && !nextBtn.disabled) nextBtn.click();
	});

})();

