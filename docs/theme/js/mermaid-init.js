// Mermaid diagram rendering for siggy docs
// Finds ```mermaid code blocks and renders them client-side.
(function () {
    'use strict';

    // Theme-aware config using CSS custom properties
    function getMermaidTheme() {
        var style = getComputedStyle(document.documentElement);
        var isDark = document.documentElement.getAttribute('data-irc-mode') === 'dark';
        return {
            theme: 'base',
            themeVariables: {
                // backgrounds
                primaryColor: isDark ? '#252e4a' : '#e2e7f0',
                primaryBorderColor: isDark ? '#6b8ed0' : '#5b7ec0',
                primaryTextColor: isDark ? '#d8dde8' : '#1e2640',
                secondaryColor: isDark ? '#2c3553' : '#d8dfe9',
                secondaryBorderColor: isDark ? '#354060' : '#a8b2c4',
                secondaryTextColor: isDark ? '#d8dde8' : '#1e2640',
                tertiaryColor: isDark ? '#1e2640' : '#edf0f5',
                tertiaryBorderColor: isDark ? '#354060' : '#a8b2c4',
                tertiaryTextColor: isDark ? '#d8dde8' : '#1e2640',
                // notes & labels
                noteBkgColor: isDark ? '#2c3553' : '#dce2ec',
                noteTextColor: isDark ? '#d8dde8' : '#1e2640',
                noteBorderColor: isDark ? '#354060' : '#a8b2c4',
                // lines & arrows
                lineColor: isDark ? '#6b8ed0' : '#5b7ec0',
                textColor: isDark ? '#d8dde8' : '#1e2640',
                // sequence diagram
                actorBkg: isDark ? '#252e4a' : '#d8dfe9',
                actorBorder: isDark ? '#6b8ed0' : '#5b7ec0',
                actorTextColor: isDark ? '#d8dde8' : '#1e2640',
                actorLineColor: isDark ? '#8090a8' : '#4a5570',
                signalColor: isDark ? '#d8dde8' : '#1e2640',
                signalTextColor: isDark ? '#d8dde8' : '#1e2640',
                labelBoxBkgColor: isDark ? '#2c3553' : '#d8dfe9',
                labelBoxBorderColor: isDark ? '#6b8ed0' : '#5b7ec0',
                labelTextColor: isDark ? '#d8dde8' : '#1e2640',
                loopTextColor: isDark ? '#d8dde8' : '#1e2640',
                activationBkgColor: isDark ? '#354060' : '#c8d0dc',
                activationBorderColor: isDark ? '#6b8ed0' : '#5b7ec0',
                sequenceNumberColor: '#ffffff',
                // flowchart
                nodeBorder: isDark ? '#6b8ed0' : '#5b7ec0',
                clusterBkg: isDark ? '#1e2640' : '#edf0f5',
                clusterBorder: isDark ? '#354060' : '#a8b2c4',
                defaultLinkColor: isDark ? '#6b8ed0' : '#5b7ec0',
                titleColor: isDark ? '#8ba5d5' : '#2c3553',
                edgeLabelBackground: isDark ? '#1e2640' : '#edf0f5',
                // font
                fontFamily: "'IBM Plex Mono', 'Cascadia Code', 'Consolas', monospace",
                fontSize: '13px',
            }
        };
    }

    function renderDiagrams() {
        var blocks = document.querySelectorAll('pre > code.language-mermaid');
        if (!blocks.length) return;

        // Load mermaid from CDN
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';
        script.onload = function () {
            mermaid.initialize(Object.assign({ startOnLoad: false }, getMermaidTheme()));

            blocks.forEach(function (codeEl, i) {
                var pre = codeEl.parentElement;
                var container = document.createElement('div');
                container.className = 'mermaid-diagram';
                container.id = 'mermaid-diagram-' + i;
                container.textContent = codeEl.textContent;
                pre.parentElement.replaceChild(container, pre);
            });

            mermaid.run({ querySelector: '.mermaid-diagram' });
        };
        document.head.appendChild(script);
    }

    // Re-render on dark mode toggle
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
            if (m.attributeName === 'data-irc-mode') {
                var diagrams = document.querySelectorAll('.mermaid-diagram');
                if (diagrams.length && typeof mermaid !== 'undefined') {
                    mermaid.initialize(Object.assign({ startOnLoad: false }, getMermaidTheme()));
                    diagrams.forEach(function (el) {
                        // Clear rendered SVG, re-render from data attribute
                        var source = el.getAttribute('data-mermaid-source') || el.textContent;
                        el.removeAttribute('data-processed');
                        el.innerHTML = source;
                    });
                    mermaid.run({ querySelector: '.mermaid-diagram' });
                }
            }
        });
    });

    document.addEventListener('DOMContentLoaded', function () {
        renderDiagrams();
        observer.observe(document.documentElement, { attributes: true });
    });
})();
