// ========================================
// Simple Chart Rendering
// ========================================

const Charts = {
    // Render a line chart
    renderLineChart(container, data, options = {}) {
        const {
            width = container.clientWidth || 600,
            height = 300,
            color = '#6366f1',
            label = 'Value',
            showPoints = true
        } = options;

        if (!data || data.length === 0) {
            container.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 300px; color: var(--text-muted);">No data available</div>';
            return;
        }

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.style.width = '100%';
        svg.style.height = 'auto';

        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        // Find min and max values
        const values = data.map(d => d.value);
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);
        const range = maxValue - minValue || 1;

        // Create points
        const points = data.map((d, i) => {
            const x = padding + (i / (data.length - 1 || 1)) * chartWidth;
            const y = padding + chartHeight - ((d.value - minValue) / range) * chartHeight;
            return { x, y, ...d };
        });

        // Draw grid lines
        const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        for (let i = 0; i <= 5; i++) {
            const y = padding + (i / 5) * chartHeight;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', padding);
            line.setAttribute('y1', y);
            line.setAttribute('x2', width - padding);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', 'rgba(255, 255, 255, 0.1)');
            line.setAttribute('stroke-width', '1');
            gridGroup.appendChild(line);

            // Y-axis labels
            const value = maxValue - (i / 5) * range;
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', padding - 10);
            text.setAttribute('y', y + 5);
            text.setAttribute('text-anchor', 'end');
            text.setAttribute('fill', 'var(--text-muted)');
            text.setAttribute('font-size', '12');
            text.textContent = value.toFixed(1);
            gridGroup.appendChild(text);
        }
        svg.appendChild(gridGroup);

        // Draw line
        const pathData = points.map((p, i) =>
            `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
        ).join(' ');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '3');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(path);

        // Draw gradient area under line
        const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const areaData = pathData + ` L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;
        areaPath.setAttribute('d', areaData);

        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', 'lineGradient-' + Utils.generateId());
        gradient.setAttribute('x1', '0');
        gradient.setAttribute('y1', '0');
        gradient.setAttribute('x2', '0');
        gradient.setAttribute('y2', '1');

        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', color);
        stop1.setAttribute('stop-opacity', '0.3');

        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', color);
        stop2.setAttribute('stop-opacity', '0');

        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        svg.appendChild(gradient);

        areaPath.setAttribute('fill', `url(#${gradient.id})`);
        svg.insertBefore(areaPath, path);

        // Draw points
        if (showPoints) {
            points.forEach(p => {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', p.x);
                circle.setAttribute('cy', p.y);
                circle.setAttribute('r', '5');
                circle.setAttribute('fill', color);
                circle.setAttribute('stroke', 'var(--bg-primary)');
                circle.setAttribute('stroke-width', '2');

                // Tooltip on hover
                circle.addEventListener('mouseenter', (e) => {
                    const tooltip = document.createElement('div');
                    tooltip.className = 'chart-tooltip';
                    tooltip.style.cssText = `
                        position: absolute;
                        background: var(--surface-glass);
                        backdrop-filter: blur(20px);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 8px;
                        padding: 8px 12px;
                        font-size: 12px;
                        pointer-events: none;
                        z-index: 1000;
                        color: var(--text-primary);
                    `;
                    tooltip.innerHTML = `
                        <div style="font-weight: 600;">${p.label || label}</div>
                        <div style="color: var(--text-secondary);">${p.value.toFixed(2)}</div>
                    `;
                    document.body.appendChild(tooltip);

                    const rect = e.target.getBoundingClientRect();
                    tooltip.style.left = rect.left + 'px';
                    tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';

                    circle._tooltip = tooltip;
                });

                circle.addEventListener('mouseleave', () => {
                    if (circle._tooltip) {
                        circle._tooltip.remove();
                        circle._tooltip = null;
                    }
                });

                svg.appendChild(circle);
            });
        }

        container.innerHTML = '';
        container.appendChild(svg);
    },

    // Render a bar chart
    renderBarChart(container, data, options = {}) {
        const {
            width = container.clientWidth || 600,
            height = 300,
            colors = ['#6366f1', '#8b5cf6', '#14b8a6', '#f59e0b', '#f43f5e']
        } = options;

        if (!data || data.length === 0) {
            container.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 300px; color: var(--text-muted);">No data available</div>';
            return;
        }

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.style.width = '100%';
        svg.style.height = 'auto';

        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        const maxValue = Math.max(...data.map(d => d.value));
        const barWidth = chartWidth / data.length * 0.8;
        const barGap = chartWidth / data.length * 0.2;

        data.forEach((d, i) => {
            const barHeight = (d.value / maxValue) * chartHeight;
            const x = padding + i * (barWidth + barGap) + barGap / 2;
            const y = padding + chartHeight - barHeight;

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width', barWidth);
            rect.setAttribute('height', barHeight);
            rect.setAttribute('fill', colors[i % colors.length]);
            rect.setAttribute('rx', '4');

            // Animate bars
            rect.style.transformOrigin = `${x + barWidth / 2}px ${padding + chartHeight}px`;
            rect.style.animation = `barGrow 0.5s ease-out ${i * 0.05}s both`;

            svg.appendChild(rect);

            // Label
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x + barWidth / 2);
            text.setAttribute('y', height - padding + 20);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', 'var(--text-secondary)');
            text.setAttribute('font-size', '12');
            text.textContent = d.label;
            svg.appendChild(text);

            // Value on top
            const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            valueText.setAttribute('x', x + barWidth / 2);
            valueText.setAttribute('y', y - 5);
            valueText.setAttribute('text-anchor', 'middle');
            valueText.setAttribute('fill', 'var(--text-primary)');
            valueText.setAttribute('font-size', '12');
            valueText.setAttribute('font-weight', '600');
            valueText.textContent = d.value.toFixed(1);
            svg.appendChild(valueText);
        });

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes barGrow {
                from { transform: scaleY(0); }
                to { transform: scaleY(1); }
            }
        `;
        svg.appendChild(style);

        container.innerHTML = '';
        container.appendChild(svg);
    },

    // Render a pie chart
    renderPieChart(container, data, options = {}) {
        const {
            width = container.clientWidth || 400,
            height = 400,
            colors = ['#6366f1', '#8b5cf6', '#14b8a6', '#f59e0b', '#f43f5e', '#3b82f6']
        } = options;

        if (!data || data.length === 0) {
            container.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 300px; color: var(--text-muted);">No data available</div>';
            return;
        }

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.style.width = '100%';
        svg.style.height = 'auto';

        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 40;

        const total = data.reduce((sum, d) => sum + d.value, 0);
        let currentAngle = -90;

        data.forEach((d, i) => {
            const sliceAngle = (d.value / total) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + sliceAngle;

            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;

            const x1 = centerX + radius * Math.cos(startRad);
            const y1 = centerY + radius * Math.sin(startRad);
            const x2 = centerX + radius * Math.cos(endRad);
            const y2 = centerY + radius * Math.sin(endRad);

            const largeArc = sliceAngle > 180 ? 1 : 0;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
                'Z'
            ].join(' ');

            path.setAttribute('d', pathData);
            path.setAttribute('fill', colors[i % colors.length]);
            path.setAttribute('stroke', 'var(--bg-primary)');
            path.setAttribute('stroke-width', '2');

            // Hover effect
            path.addEventListener('mouseenter', () => {
                path.style.transform = 'scale(1.05)';
                path.style.transformOrigin = `${centerX}px ${centerY}px`;
                path.style.transition = 'transform 0.2s';
            });

            path.addEventListener('mouseleave', () => {
                path.style.transform = 'scale(1)';
            });

            svg.appendChild(path);

            // Label
            const labelAngle = startAngle + sliceAngle / 2;
            const labelRad = (labelAngle * Math.PI) / 180;
            const labelX = centerX + (radius * 0.7) * Math.cos(labelRad);
            const labelY = centerY + (radius * 0.7) * Math.sin(labelRad);

            const percentage = ((d.value / total) * 100).toFixed(1);
            if (parseFloat(percentage) > 5) { // Only show label if slice is large enough
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', labelX);
                text.setAttribute('y', labelY);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('fill', 'white');
                text.setAttribute('font-size', '14');
                text.setAttribute('font-weight', '600');
                text.textContent = `${percentage}%`;
                svg.appendChild(text);
            }

            currentAngle = endAngle;
        });

        // Legend
        const legend = document.createElement('div');
        legend.style.cssText = 'display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 1rem; justify-content: center;';

        data.forEach((d, i) => {
            const item = document.createElement('div');
            item.style.cssText = 'display: flex; align-items: center; gap: 0.5rem;';
            item.innerHTML = `
                <div style="width: 16px; height: 16px; background: ${colors[i % colors.length]}; border-radius: 4px;"></div>
                <span style="color: var(--text-secondary); font-size: 0.875rem;">${d.label}: ${d.value}</span>
            `;
            legend.appendChild(item);
        });

        container.innerHTML = '';
        container.appendChild(svg);
        container.appendChild(legend);
    }
};
