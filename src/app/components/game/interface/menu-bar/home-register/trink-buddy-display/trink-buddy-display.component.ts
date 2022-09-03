import { AfterViewInit, Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import { GameStateService } from '../../../../../../services/game-state.service';
import { GameActionType, MessageType } from '../../../../../../model/WsData';
import { Link } from '../../../../../../model/state/Link';
import { ArraySchema, MapSchema } from '@colyseus/schema';
import { Player } from 'src/app/model/state/Player';

export enum Colors {
  Orange = '#ffa822',
  DarkBlue = '#134e6f',
  Red = '#ff6150',
  WTFBlue = '#1ac0c6',
  Grey = '#dee0e6',
  LightGray = 'lightgray',
  Black = 'black',
  White = 'white',
}

export const ColorPalette = [Colors.Orange, Colors.DarkBlue, Colors.Red, Colors.WTFBlue, Colors.Grey];

@Component({
  selector: 'app-trink-buddy-display',
  templateUrl: './trink-buddy-display.component.html',
  styleUrls: ['./trink-buddy-display.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class TrinkBuddyDisplayComponent implements AfterViewInit {
  @ViewChild('chart') chart: ElementRef;

  errorText = '';

  radius = 5;
  svg;
  simulation = undefined;

  links = [];
  private drawnLinks;
  nodes = [];

  // prevent rendering before view is initialized
  private viewInitialized = false;

  constructor(private gameState: GameStateService) {
    // TODO: Change callback registration to new version as soon as some one builds one (13/10/20).
    this.gameState.observableState.drinkBuddyLinks$.subscribe((drinkBuddyLinks: ArraySchema<Link>) => {
      this.links = drinkBuddyLinks.map((link: Link) => ({ source: link.source, target: link.target }));
      console.log('links are', this.links);
      this.refreshChart();
    });
    this.gameState.observableState.playerList$.subscribe((playerList: MapSchema<Player>) => {
      this.nodes = [];
      playerList.forEach((player: Player) => {
        this.nodes.push({ id: player.displayName });
      });
      console.log('nodes are', this.nodes);
      if (this.nodes.length <= 0) {
        console.warn('Failed to fetch new node data. Nodes now: ', this.nodes);
      }
      this.refreshChart();
    });
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    this.refreshChart();
  }

  addLink(from: HTMLInputElement, to: HTMLInputElement): void {
    const source = String(from.value).trim();
    const target = String(to.value).trim();
    const validation = this.validateInput(from, to);
    if (validation.isFromValid && validation.isToValid && !validation.isAlreadyLinked) {
      this.gameState.sendMessage(MessageType.GAME_MESSAGE, {
        type: MessageType.GAME_MESSAGE,
        action: GameActionType.addDrinkbuddies,
        source: source,
        target: target,
      });
    }
    if (validation.isAlreadyLinked) {
      this.errorText = target + ' is already the drinking buddy of ' + source;
    }
  }

  removeLink(from: HTMLInputElement, to: HTMLInputElement): void {
    const source = String(from.value).trim();
    const target = String(to.value).trim();
    const validation = this.validateInput(from, to);
    if (validation.isFromValid && validation.isToValid && validation.isAlreadyLinked) {
      this.gameState.sendMessage(MessageType.GAME_MESSAGE, {
        type: MessageType.GAME_MESSAGE,
        action: GameActionType.removeDrinkbuddies,
        source: source,
        target: target,
      });
    }
    if (!validation.isAlreadyLinked) {
      this.errorText = target + ' is not the drinking buddy of ' + source;
    }
  }

  refreshChart(): void {
    if (this.viewInitialized) {
      if (this.simulation !== undefined) {
        this.simulation.stop();
        this.svg.remove();
      }
      this.simulation = undefined;
      this.simulation = this.buildSimulation();
    }
  }

  private buildSimulation() {
    const chartWidth = this.chart.nativeElement.offsetWidth;
    const chartHeight = this.chart.nativeElement.offsetHeight;

    const knownNodes = this.nodes.map((n) => n.id);
    this.drawnLinks = this.links.filter((link: Link) => {
      return knownNodes.indexOf(link.source) !== -1 && knownNodes.indexOf(link.target) !== -1;
    });

    // Define simulation
    const simulation = d3
      .forceSimulation(this.nodes)
      .force(
        'link',
        d3
          .forceLink(this.drawnLinks)
          .id((d) => d['id'])
          .distance(50)
      )
      .force('charge', d3.forceManyBody().strength(-5))
      .force('center', d3.forceCenter(chartWidth / 2, chartHeight / 2))
      .force(
        'collision',
        d3.forceCollide().radius(() => this.radius)
      );

    // Build container svg inside figure tag
    this.svg = d3.select('#chart').append('svg').style('stroke', Colors.Grey).attr('width', chartWidth).attr('height', chartHeight);

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
      .style('stroke', Colors.White)
      .style('opacity', '0.9')
      .style('fill', Colors.White);

    // Define look and feel of nodes, labels and lines

    const link = this.svg
      .append('g')
      .attr('class', 'links')
      .attr('stroke-opacity', 1)
      .selectAll('line')
      .data(this.drawnLinks)
      .join('line')
      .attr('stroke', () => {
        return ColorPalette[Math.floor(Math.random() * ColorPalette.length)];
      })
      .attr('stroke-width', 1)
      .attr('marker-end', 'url(#triangle)');

    const node = this.svg
      .append('g')
      .attr('class', 'node-group')
      .attr('stroke', Colors.Black)
      .attr('stroke-width', 1)
      .selectAll('circle')
      .data(this.nodes)
      .join('circle')
      .attr('r', this.radius)
      .call(this.drag(simulation));

    const labels = this.svg
      .append('g')
      .attr('class', 'labels-group disable-select')
      .attr('stroke', 'none')
      .attr('font-size', 12)
      .attr('text-anchor', 'middle')
      .attr('fill', Colors.Grey)
      .attr('pointer-events', 'none')
      .selectAll('node-group')
      .data(this.nodes)
      .join('text')
      .attr('fill', Colors.LightGray)
      .text((d) => d.id);

    // Define simulation update function
    simulation.on('tick', () => {
      node
        .attr('cx', (d) => Math.max(this.radius, Math.min(chartWidth - this.radius, d.x)))
        .attr('cy', (d) => Math.max(this.radius, Math.min(chartHeight - this.radius, d.y)));

      labels
        .attr('x', (d) => Math.max(this.radius, Math.min(chartWidth - this.radius, d.x)))
        .attr('y', (d) => Math.max(this.radius, Math.min(chartHeight - this.radius, d.y - 10)));

      link
        .attr('x1', (d) => Math.max(this.radius, Math.min(chartWidth - this.radius, d.source.x)))
        .attr('y1', (d) => Math.max(this.radius, Math.min(chartHeight - this.radius, d.source.y)))
        .attr('x2', (d) => Math.max(this.radius, Math.min(chartWidth - this.radius, d.target.x)))
        .attr('y2', (d) => Math.max(this.radius, Math.min(chartHeight - this.radius, d.target.y)));
    });

    return simulation;
  }

  private drag(simulation) {
    function dragstarted(event) {
      if (!event.active) {
        simulation.alphaTarget(0.3).restart();
      }
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) {
        simulation.alphaTarget(0);
      }
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
  }

  private validateInput(from: HTMLInputElement, to: HTMLInputElement) {
    const source = String(from.value).trim();
    const target = String(to.value).trim();

    let isFromValid = false;
    let isToValid = false;
    let isAlreadyLinked = false;

    for (const node of this.nodes) {
      if (node.id === source) {
        isFromValid = true;
      }
      if (node.id === target) {
        isToValid = true;
      }
    }
    for (const link of this.drawnLinks) {
      console.log('indexes', link.source, link.target);
      if (this.nodes[link.source.index].id === source && this.nodes[link.target.index].id === target) {
        isAlreadyLinked = true;
      }
    }

    if (!isToValid) {
      this.errorText = 'Target name was not found.';
    }
    if (!isFromValid) {
      this.errorText = 'Source name was not found.';
    }
    if (source === '' || target === '') {
      this.errorText = 'At least one name was empty.';
    }
    setTimeout(() => {
      this.errorText = '';
    }, 6000);

    return { isFromValid: isFromValid, isToValid: isToValid, isAlreadyLinked: isAlreadyLinked };
  }
}
