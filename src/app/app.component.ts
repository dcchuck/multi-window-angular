declare var fin: any;
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    title = 'app';
    private appName: string;
    private serviceConnection: any;
    private ticker: number;
    private targetAppId: number;
    private lastIncrementerMessage: string;
    private directMessage: string;
    private incrementBy: string;

    constructor(private cd: ChangeDetectorRef) {}

    ngOnInit() {
        this.appName = fin.desktop.Application.getCurrent().uuid;
        fin.desktop.Service.connect({ uuid: 'service' }).then(connection => {
            this.serviceConnection = connection;
            this.serviceConnection.register('valueUpdated', (x) => {
                this.ticker = x;
                this.cd.detectChanges();
            });
            this.serviceConnection.dispatch('getValue').then(x => {
                this.ticker = x;
                this.cd.detectChanges();
            });
        });
        fin.desktop.InterApplicationBus.subscribe('*', 'direct-message', (m, u, a) => {
            console.log(m);
            this.directMessage = m;
            this.cd.detectChanges();
        });
    }

    increment() {
        if (this.incrementBy) {
            const amount = parseInt(this.incrementBy, 10);
            this.serviceConnection.dispatch('incrementBy', { amount: amount }).then(x => {
                this.lastIncrementerMessage = `I Incremented To ${x}`;
            });
        } else {
            this.serviceConnection.dispatch('increment').then(x => {
                this.lastIncrementerMessage = `I Incremented To ${x}`;
            });
        }
    }

    sendIAB() {
        fin.desktop.InterApplicationBus.send(`Angular-${this.targetAppId}`, 'direct-message', `Hello from ${this.appName}`);
    }
}

/*
document.addEventListener('DOMContentLoaded', () => {
    const ofVersion = document.getElementById('no-openfin');
    if (typeof fin !== 'undefined') {
        init();
    } else {
        ofVersion.innerText = 'OpenFin is not available - you are probably running in a browser.';
    }
});

function init () {
    fin.desktop.System.getVersion(version => {
        console.log(version);
    });

    document.title = `App UUID: ${fin.desktop.Application.getCurrent().uuid}`;
}

let serviceConnection;

const ticker = document.getElementById('ticker');

async function makeCounter () {
    const serviceClient = await fin.desktop.Service.connect({uuid:'service'});
    serviceClient.onServiceDisconnect(service=>console.log('Service disconnected!', service));
    serviceClient.register('valueUpdated', (x) => ticker.innerText = x);
    return {
        increment: () => serviceClient.dispatch('increment'),
        incrementBy: (x) => serviceClient.dispatch('incrementBy', {amount: x}),
        getValue: () => serviceClient.dispatch('getValue')
    }
}

const inc = document.getElementById('increment');

makeCounter().then(s => {
    s.getValue().then(x => ticker.innerText = x );
    serviceConnection = s;
});

inc.onclick = () => {
	const incrementer = document.getElementById('increment-by');
	if (incrementer.value) {
		serviceConnection.incrementBy(parseInt(incrementer.value)).then(x => {
			const updateDiv = document.getElementById('last-update');
			updateDiv.innerText = `I Incremeneted To ${x}`;
		})

	} else {
		serviceConnection.increment().then(x => {
			console.log(x)
			const updateDiv = document.getElementById('last-update');
			updateDiv.innerText = `I Incremeneted To ${x}`;
		})
	}
}
*/
