<script lang="ts">
    type Props = {
        checkedPoints: number;
        uncheckedPoints: number;
        totalPoints: number;
    };

    const { checkedPoints, uncheckedPoints, totalPoints }: Props = $props();
</script>

<!--  TODO: Improve UI  -->
<div class="bg-csi-neutral-900 mb-8 flex h-min w-1/2 flex-col gap-y-2.5 rounded-2xl p-6">
    <h2 class="text-csi-blue text-3xl font-bold">Constiquiz Submitted</h2>
    <p class="text-justify">
        Your answers have been submitted, but your grade is not yet complete. The score below shows the calculated score
        for the <em>close-ended questions</em>. We are currently in the process of grading your responses to the
        <em>open-ended questions</em>. We will update you when your scores are released.
    </p>
    <p>Calculated Score: {checkedPoints}/{totalPoints}</p>
    <p>Total points of unchecked items: {uncheckedPoints}</p>
</div>
