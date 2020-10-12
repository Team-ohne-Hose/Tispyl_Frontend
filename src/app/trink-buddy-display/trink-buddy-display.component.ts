import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
// @ts-ignore
import data from '../trink-buddy-display/miserables.json';
import * as d3 from 'd3';
import {GameStateService} from '../services/game-state.service';
import {Player} from '../model/state/Player';


@Component({
  selector: 'app-trink-buddy-display',
  templateUrl: './trink-buddy-display.component.html',
  styleUrls: ['./trink-buddy-display.component.css']
})
export class TrinkBuddyDisplayComponent implements AfterViewInit {

  @ViewChild('chart') chart: ElementRef;

  errorText = '';

  radius = 5;
  svg;
  simulation = undefined;

  links = [];
  nodes = [];

  constructor(private gameState: GameStateService) {}

  ngAfterViewInit(): void {
    this.nodes = this.gameState !== undefined ? [] : this.fetchNodeData();
    this.simulation = this.buildSimulation();
  }

  fetchNodeData() {
    const schema = this.gameState.getState().playerList;
    const tmpArray: Player[] = [];
    for (const id in schema) {
      if (id in schema) {
        tmpArray.push(schema[id]);
      }
    }
    return tmpArray.map( p => {
      const node = {};
      node['id'] = p.displayName;
      return node;
    });
  }

  buildSimulation() {
    const chartWidth = this.chart.nativeElement.offsetWidth;
    const chartHeight = this.chart.nativeElement.offsetHeight;

    // Define simulation
    const simulation = d3.forceSimulation(this.nodes)
      .force('link', d3.forceLink(this.links).id(d => d['id']).distance(50))
      .force('charge', d3.forceManyBody().strength(-5))
      .force('center', d3.forceCenter(chartWidth / 2, chartHeight / 2))
      .force('collision', d3.forceCollide().radius(d => this.radius));

    // Build container svg inside figure tag
    this.svg = d3
      .select('#chart')
      .append('svg')
        .style('stroke', 'grey')
        .attr('width', chartWidth )
        .attr('height', chartHeight);

    // Define triangle-shape
    this.svg
      .append('svg:defs')
      .append('svg:marker')
        .attr('id', 'triangle')
        .attr('refX', 14)
        .attr('refY', 4)
        .attr('markerWidth', 12)
        .attr('markerHeight', 12)
        .attr('orient', 'auto')
      .append('path')
        .attr('d', 'M 0 0 8 4 0 8 2 4')
        .style('fill', 'grey');

    // Define look and feel of nodes, labels and lines
    const link = this.svg
      .append('g')
        .attr('class', 'links')
        .attr('stroke', 'grey')
        .attr('stroke-opacity', 0.6)
      .selectAll('line')
        .data(this.links)
        .join('line')
        .attr('stroke-width', 1)
        .attr('marker-end', 'url(#triangle)');

    const node = this.svg
      .append('g')
        .attr('class', 'node-group')
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
      .selectAll('circle')
        .data(this.nodes)
        .join('circle')
        .attr('r', this.radius)
        .call(this.drag(simulation));

    const labels = this.svg
      .append('g')
        .attr('class', 'labels-group')
        .attr('stroke', 'none')
        .attr('font-size', 12)
        .attr('text-anchor', 'middle')
        .attr('fill', 'grey')
        .attr('pointer-events', 'none')
      .selectAll('node-group')
        .data(this.nodes)
        .join('text')
        .text(d => d.id);

    // Define simulation update function
    simulation.on('tick', () => {
      node
        .attr('cx', d => Math.max(this.radius, Math.min(chartWidth - this.radius, d.x)))
        .attr('cy', d => Math.max(this.radius, Math.min(chartHeight - this.radius, d.y)));

      labels
        .attr('x', d => Math.max(this.radius, Math.min(chartWidth - this.radius, d.x)))
        .attr('y', d => Math.max(this.radius, Math.min(chartHeight - this.radius, d.y - 10)));

      link
        .attr('x1', d => Math.max(this.radius, Math.min(chartWidth - this.radius, d.source.x)))
        .attr('y1', d => Math.max(this.radius, Math.min(chartHeight - this.radius, d.source.y)))
        .attr('x2', d => Math.max(this.radius, Math.min(chartWidth - this.radius, d.target.x)))
        .attr('y2', d => Math.max(this.radius, Math.min(chartHeight - this.radius, d.target.y)));
    });

    return simulation;
  }

  drag(simulation) {
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  addLink(from: HTMLInputElement, to: HTMLInputElement) {
    const source = String(from.value).trim();
    const target = String(to.value).trim();

    console.log(source, target);

    let isFromValid = false;
    let isToValid = false;
    let isAlreadyLinked = false;

    for ( const node of this.nodes ) {
      if (node.id === source) {
        isFromValid = true;
      }
      if (node.id === target) {
        isToValid = true;
      }
    }

    console.log('from:', isFromValid, 'to:', isToValid);
    if (isFromValid && isToValid) {
      for ( const link of this.links ) {
        console.log(link);
        if (this.nodes[link.source.index].id === source && this.nodes[link.target.index].id === target) {
          isAlreadyLinked = true;
        }
      }
      console.log('AlreadyLinkes:', isAlreadyLinked);
      if (!isAlreadyLinked) {
        this.updateChartLink({source: source, target: target});
      }
    }

    if (isAlreadyLinked) { this.errorText = target + ' is already the drinking buddy of' + source; }
    if (!isToValid) { this.errorText = 'Target name was not found.'; }
    if (!isFromValid) { this.errorText = 'Source name was not found.'; }
    if (source === '' || target === '') { this.errorText = 'At least one name was empty.'; }


    setTimeout(() => { this.errorText = ''; }, 6000);
  }

  updateChartLink(link: any) {
    this.simulation.stop();
    this.svg.remove();
    this.simulation = undefined;
    this.links.push(link);
    this.simulation = this.buildSimulation();
  }

  refreshChart(event) {
    this.simulation.stop();
    this.svg.remove();
    this.simulation = undefined;
    this.nodes = this.fetchNodeData();
    setTimeout(() => {this.simulation = this.buildSimulation(); }, 1000);
  }

}
