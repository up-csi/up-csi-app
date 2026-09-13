<script lang="ts">
    type Props = {
        checkedPoints: number;
        uncheckedPoints: number;
        totalPoints: number;
    };

    const { checkedPoints, uncheckedPoints, totalPoints }: Props = $props();
</script>

<!--  TODO: Improve UI  -->
<div class="border-stardew-border-dark bg-stardew-border-fill mb-8 h-min w-3/4 border-6 p-1 md:w-1/2">
    <div
        class="from-stardew-bg-light to-stardew-bg-dark border-stardew-border-dark flex flex-col gap-y-2.5 border-6 bg-linear-to-b p-6"
    >
        <h2 class="text-csi-blue font-stardew-body text-5xl">Constiquiz Submitted</h2>
        <p class="font-stardew-body text-stardew-font-color text-justify text-xl">
            {#if uncheckedPoints > 0}
                Your answers have been submitted, but your grade is not yet complete. The score below shows the
                calculated score for this quiz <em>close-ended questions</em>.
                <b
                    >We are currently in the process of grading your responses to the
                    <em>open-ended questions</em>. We will update you when your scores are released.</b
                >
            {:else}
                Your answers have been <em>submitted and graded</em>. The score below shows your entire score for this
                quiz. If you have any concerns or questions regarding your score, kindly let your apps process head
                know.
            {/if}
        </p>
        <p class="font-stardew-body text-stardew-font-color text-xl">
            Calculated Score: <span class="text-csi-blue">{checkedPoints}/{totalPoints}</span>
        </p>
        {#if uncheckedPoints > 0}
            <p>Total points of unchecked items: <b>{uncheckedPoints}</b></p>
        {/if}
    </div>
</div>
