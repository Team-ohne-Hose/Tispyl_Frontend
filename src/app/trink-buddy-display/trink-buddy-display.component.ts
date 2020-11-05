import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import * as d3 from 'd3';
import {GameStateService} from '../services/game-state.service';
import {GameActionType, MessageType} from '../model/WsData';


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

  constructor(private gameState: GameStateService) {
    // TODO: Change callback registration to new version as soon as some one builds one (13/10/20).
    if (gameState.getState() !== undefined) {
      gameState.getState().drinkBuddyLinks.onAdd = (link, key) => {
        console.log("Link was added: ", link.source, link.target);
        setTimeout(() => this.refreshChart(), 2000); // find out why this timeout needs to exist !
      };
      gameState.getState().drinkBuddyLinks.onRemove = (link, key) => {
        console.log("Link was removed: ", link.source, link.target);
        setTimeout(() => this.refreshChart(), 2000); // find out why this timeout needs to exist !
      };
    } else {
      console.warn('Unable to register Trinkbuddy-link onAdd & onRemove callbacks. GameStateService.getState() returned: ', gameState.getState());
    }
  }

  ngAfterViewInit(): void {
    this.refreshChart();
  }

  private buildSimulation() {
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

  private drag(simulation) {
    function dragstarted(event) {
      if (!event.active) { simulation.alphaTarget(0.3).restart(); }
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) { simulation.alphaTarget(0); }
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
    const validation = this.validateInput(from, to);
    if (validation.isFromValid && validation.isToValid && !validation.isAlreadyLinked) {
      console.log( source, target, this.gameState.getRoom().state.drinkBuddyLinks);
      this.gameState
        .getRoom()
        .send(MessageType.GAME_MESSAGE, { type: MessageType.GAME_MESSAGE, action: GameActionType.addDrinkbuddies, source: source, target: target});
    }
    if (validation.isAlreadyLinked) { this.errorText = target + ' is already the drinking buddy of' + source; }
  }

  removeLink(from: HTMLInputElement, to: HTMLInputElement) {
    const source = String(from.value).trim();
    const target = String(to.value).trim();
    const validation = this.validateInput(from, to);
    if (validation.isFromValid && validation.isToValid && validation.isAlreadyLinked) {
      this.gameState
        .getRoom()
        .send(MessageType.GAME_MESSAGE, { type: MessageType.GAME_MESSAGE, action: GameActionType.removeDrinkbuddies, source: source, target: target});
    }
    if (!validation.isAlreadyLinked) { this.errorText = target + ' is not the drinking buddy of' + source; }
  }

  private validateInput(from: HTMLInputElement, to: HTMLInputElement) {
    const source = String(from.value).trim();
    const target = String(to.value).trim();

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
    for ( const link of this.links ) {
      if (this.nodes[link.source.index].id === source && this.nodes[link.target.index].id === target) {
        isAlreadyLinked = true;
      }
    }

    if (!isToValid) { this.errorText = 'Target name was not found.'; }
    if (!isFromValid) { this.errorText = 'Source name was not found.'; }
    if (source === '' || target === '') { this.errorText = 'At least one name was empty.'; }
    setTimeout(() => { this.errorText = ''; }, 6000);

    return {isFromValid: isFromValid, isToValid: isToValid, isAlreadyLinked: isAlreadyLinked};
  }

  refreshChart() {
    if (this.simulation !== undefined) {
      this.simulation.stop();
      this.svg.remove();
    }
    this.simulation = undefined;
    this.fetchNodeData();
    this.fetchLinkData();
    this.simulation = this.buildSimulation();
  }

  private fetchNodeData() {
    const state = this.gameState.getState();
    if (state !== undefined) {
      this.nodes = [];
      state.playerList.forEach(p => {
        this.nodes.push({id: p.displayName});
      });
    } else {
      console.warn('Failed to fetch new node data, because the game state was not defined. Nodes now: ', this.links);
    }
  }

  private fetchLinkData() {
    const state = this.gameState.getState();
    if (state !== undefined) {
      this.links = [];
      const remoteLinks = state.drinkBuddyLinks;
      const knownNodes = this.nodes.map((n) => n.id);
      for ( const key in remoteLinks ) {
        if (knownNodes.indexOf(remoteLinks[key].source) !== -1 && knownNodes.indexOf(remoteLinks[key].target) !== -1) {
          this.links.push({source: remoteLinks[key].source, target: remoteLinks[key].target});
        }
      }
    } else {
      console.warn('Failed to fetch new link data, because the game state was not defined. Links now: ', this.links);
    }
  }

}
