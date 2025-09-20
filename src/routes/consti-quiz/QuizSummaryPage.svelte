<script lang="ts">
    type Props = {
        checkedPoints: number;
        uncheckedPoints: number;
        totalPoints: number;
    };

    const { checkedPoints, uncheckedPoints, totalPoints }: Props = $props();
</script>

<!--  TODO: Improve UI  -->
<div class="bg-csi-neutral-900 mb-8 flex h-min w-3/4 flex-col gap-y-2.5 rounded-2xl p-6 md:w-1/2">
    <h2 class="text-csi-blue text-3xl font-bold">Constiquiz Submitted</h2>
    <p class="text-justify">
        {#if uncheckedPoints > 0}
            Your answers have been submitted, but your grade is not yet complete. The score below shows the calculated
            score for this quiz <em>close-ended questions</em>.
            <b
                >We are currently in the process of grading your responses to the
                <em>open-ended questions</em>. We will update you when your scores are released.</b
            >
        {:else}
            Your answers have been <em>submitted and graded</em>. The score below shows your entire score for this quiz.
            If you have any concerns or questions regarding your score, kindly let your apps process head know.
        {/if}
    </p>
    <p>Calculated Score: <b>{checkedPoints}/{totalPoints}</b></p>
    {#if uncheckedPoints > 0}
        <p>Total points of unchecked items: <b>{uncheckedPoints}</b></p>
    {/if}
</div>
