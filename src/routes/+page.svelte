<script lang="ts">
    const sigTotal = 34;
    const signatureSheet = [
        { name: 'Executive', progress: 18, progressString: '', color: 'bg-cyan-400' },
        { name: 'Membership & Internals', progress: 12, progressString: '', color: 'bg-pink-400' },
        { name: 'Service', progress: 17, progressString: '', color: 'bg-yellow-400' },
        { name: 'Innovation', progress: 20, progressString: '', color: 'bg-orange-400' },
        { name: 'Engineering', progress: 34, progressString: '', color: 'bg-red-500' },
        { name: 'External Relations', progress: 30, progressString: '', color: 'bg-blue-500' },
        { name: 'Branding and Creatives', progress: 25, progressString: '', color: 'bg-green-500' },
    ];
    signatureSheet.forEach(committee => {
        committee.progressString = `${committee.progress}/${sigTotal}`;
    });

    const quizTotal = 40;
    let quizProgress = 28;
    let quizString = `${quizProgress}/${quizTotal}`;

    function calculatePercentage(portion: number, total: number) {
        if (portion && total) return (portion / total) * 100;
    }

    // take note month starts at 0
    // sample deadline is May 31, 6:30 PM
    const quizRawDeadline = new Date(2025, 4, 31, 18, 30, 0);
    const deadlineHour = quizRawDeadline.getHours();
    const deadlineMinutes = quizRawDeadline.getMinutes();
    let quizDeadline = quizRawDeadline.getTime();
    let daysLeft = 0;
    let hoursLeft = 0;
    let quizClosingString = '';

    function updateTimeLeft() {
        let now = new Date().getTime();
        console.log(now);

        let timeLeft = quizDeadline - now;

        daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        hoursLeft = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (timeLeft < 0) {
            quizClosingString = 'The quiz has closed.';
        } else if (daysLeft < 1 && hoursLeft < 1) {
            quizClosingString = `The quiz will close at ${deadlineHour % 12}:${(deadlineMinutes < 10 ? '0' : '') + deadlineMinutes} ${deadlineHour >= 12 ? 'PM' : 'AM'}.`;
        } else {
            let daysString = `${daysLeft}` + (daysLeft == 1 ? ' day' : ' days');
            let hoursString = `${hoursLeft}` + (hoursLeft == 1 ? ' hour' : ' hours');
            let hasAnd = daysLeft > 0 && hoursLeft > 0;

            quizClosingString = `The quiz will close in ${daysLeft <= 0 ? '' : daysString}${hasAnd ? ' and ' : ''}${hoursLeft <= 0 ? '' : hoursString}.`;
        }
    }

    updateTimeLeft();
    setInterval(updateTimeLeft, 1000);
</script>

<div class="font-inter h-screen flex-1 flex-row bg-[#161619] p-6">
    <h1 class="text-csi-white flex w-100 text-5xl font-bold">Your Dashboard</h1>

    <main class="mt-6 flex justify-evenly">
        <div class="bg-csi-neutral-900 flex w-3/7 flex-col gap-y-2.5 rounded-2xl p-6">
            <h2 class="text-csi-blue text-3xl font-bold">Signature Sheet</h2>

            {#each signatureSheet as section}
                <div>
                    <div class="flex justify-between">
                        <h3 class="text-csi-white">{section.name}</h3>
                        <p class="text-csi-white">{section.progressString}</p>
                    </div>
                    <div class="mt-1 h-6 w-full overflow-hidden rounded-full bg-gray-700">
                        <div
                            class="{section.color} h-full"
                            style="width: {calculatePercentage(section.progress, sigTotal)}%"
                        ></div>
                    </div>
                </div>
            {/each}
        </div>

        <div class="bg-csi-neutral-900 flex w-3/7 flex-col gap-y-4 rounded-2xl p-6">
            <h2 class="text-csi-blue text-3xl font-bold">Constitution Quiz</h2>
            <div class="flex justify-between">
                <h3 class="text-csi-white">Progress</h3>
                <p class="text-csi-white">{quizString}</p>
            </div>
            <div class="mt-1 h-4 w-full overflow-hidden rounded-full bg-gray-700">
                <div class="h-full bg-cyan-400" style="width: {calculatePercentage(quizProgress, quizTotal)}%"></div>
            </div>
            <p class="text-csi-white">{quizClosingString}</p>
            <p class="text-csi-white">Constitution quiz mechanics</p>
            <a
                href="./consti-quiz"
                class="bg-csi-blue w-1/6 self-center rounded-3xl py-2 text-center font-bold text-[#161619]">Continue</a
            >
        </div>
    </main>
</div>
