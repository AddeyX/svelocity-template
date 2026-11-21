<script lang="ts">
	import './layout.css';

	let { children } = $props();
</script>

<div class="arrive mx-auto flex min-h-screen w-full max-w-xl flex-col px-6 py-16">
	{@render children()}
</div>
