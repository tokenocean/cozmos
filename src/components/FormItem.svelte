<script>
    export let title = "No Title";
        export let text = "text-left";
</script>
 
<div class={$$props.class || ""}>
    <div class="text-md text-black {text} font-semibold">{ title }</div>
    <slot/>
</div>
