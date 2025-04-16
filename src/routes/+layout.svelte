<script>
	import '../fonts.css';
</script>

<svelte:head>
    <title>Capy Game Concept</title>
    <link rel="preload" as="font" href="https://fonts.gstatic.com/s/quantico/v17/rax4HiSdp9cPL3KIF7xuFD96ng.woff2" type="font/woff2" />
    <link rel="preload" as="font" href="https://fonts.gstatic.com/s/quantico/v17/rax7HiSdp9cPL3KIF7xuHIRfi0349A.woff2" type="font/woff2" />
    <link rel="preload" as="font" href="https://fonts.gstatic.com/s/quantico/v17/rax-HiSdp9cPL3KIF7xrJD0.woff2" type="font/woff2" />
    <link rel="preload" as="font" href="https://fonts.gstatic.com/s/quantico/v17/rax5HiSdp9cPL3KIF7TQAShdu08.woff2" type="font/woff2" />
</svelte:head>

<slot />

<style>
    :global(body) {
        background-color: #0cc9bd;
        margin: 0;
        padding: 0;
        color: rgba(255, 255, 255, 0.87);
        background-color: #000000;
        font-family: 'Quantico';
    }
    :global(canvas) {
        font-family: 'Quantico';
    }
</style>