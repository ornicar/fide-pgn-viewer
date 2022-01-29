import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';

import { scaleLinear } from 'd3-scale';
import { curveCardinal, line } from 'd3-shape';
import { select, Selection } from 'd3-selection';
import { axisBottom, axisLeft } from 'd3-axis';

@Component({
  selector: 'score-timeline-chart',
  templateUrl: './score-timeline-chart.component.html',
  styleUrls: ['./score-timeline-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class ScoreTimelineChartComponent implements OnChanges, AfterViewChecked, AfterViewInit, OnDestroy {
  @Input() scores: number[] = [];
  // @Input() isWhiteMode = false;

  @ViewChild('chart', { read: ElementRef, static: true }) chart: ElementRef;

  readonly maxScore = 4;

  readonly DEFAULT_COLOR = '#00b173';
  // readonly WHITE_COLOR = '#D2CAFF';

  private prevWidth: number = null;
  private resizeObserver: ResizeObserver;

  constructor(private elementRef: ElementRef) {}

  private getScoresString(scores?: number[]) {
    return (scores || []).reduce((result, score) => result + score.toString(), '');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      // to avoid redraw when nothing changed
      (changes.scores
        && this.getScoresString(changes.scores.currentValue) !== this.getScoresString(changes.scores.previousValue))
    ) {
      this.updateChart();
    }
  }

  ngAfterViewChecked() {
    // if (this.elementRef.nativeElement.clientWidth !== this.prevWidth) {
    //   this.prevWidth = this.elementRef.nativeElement.clientWidth;
    //   this.updateChart();
    // }
  }

  private updateChart(): void {
    // const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const margin = { top: 0, right: 0, bottom: 0, left: 0 };
    const width = this.elementRef.nativeElement.clientWidth - margin.left - margin.right;
    const height = this.elementRef.nativeElement.clientHeight - margin.top - margin.bottom;

    const svg: Selection<any, any, any, any> = select(this.chart.nativeElement);
    // .attr('width', width + margin.left + margin.right)
    // .attr('height', height + margin.top + margin.bottom)
    // .append('g')
    // .attr('transform',
    //   'translate(' + margin.left + ',' + margin.top + ')');

    // const points = this.scores.map(score => {
    //   score = score <= this.maxScore ? score : this.maxScore;
    //   score = score >= -this.maxScore ? score : -this.maxScore;
    //   return [0, score];
    // });

    const minY = -this.maxScore;
    const maxY = this.maxScore;
    const countMove = this.scores.length - 1;

    // const width = this.elementRef.nativeElement.clientWidth;
    // const height = this.elementRef.nativeElement.clientHeight;
    // console.log(`chart width`, width);

    const xScale = scaleLinear()
      .domain([0, countMove])
      .range([0, width]);

    const yScale = scaleLinear()
      .domain([minY, maxY])
      .range([height, 0]);

    const dataset = this.scores
      .map((s, idx) => {
        let score = Math.min(s, maxY);
        score = Math.max(score, minY);
        return { score, idx };
      });

    const scoreLine = line()
      .x(d => xScale(d['idx'])) // set the x values for the line generator
      .y(d => yScale(d['score'])) // set the y values for the line generator
      .curve(curveCardinal); // apply smoothing to the line

    svg.selectAll('path').remove();
    svg.selectAll('g').remove();

    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', 'translate(0,' + height + ')')
      .call(
        axisBottom(xScale)
          .ticks(Math.ceil(countMove / 2))
          .tickSize(-height)
          .tickFormat(null)
      );

    // add the Y gridlines
    svg.append('g')
      .attr('class', 'grid')
      .call(
        axisLeft(yScale)
          .ticks(this.maxScore * 2 + 1)
          .tickSize(-width)
          .tickFormat(null)
      );

    svg.append('path')
      .data([dataset]) // 10. Binds data to the line
      .attr('class', 'line') // Assign a class for styling
      .attr('d', scoreLine as any);
    // .attr('fill', this.DEFAULT_COLOR); // 11. Calls the line generator
    // svg.selectAll('path')
    //   .data([points])
    //   .enter()
    //   .append('path')
    //   .attr('d', _area)
    //   .attr('fill', this.DEFAULT_COLOR);
  }

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => this.updateChart());
    this.resizeObserver.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) this.resizeObserver.disconnect();
  }
}
