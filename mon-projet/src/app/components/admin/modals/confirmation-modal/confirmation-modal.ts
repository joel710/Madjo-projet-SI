import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-confirmation-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './confirmation-modal.html',
    styleUrls: ['./confirmation-modal.css']
})
export class ConfirmationModalComponent {
    @Input() isOpen: boolean = false;
    @Input() title: string = 'Confirmation';
    @Input() message: string = '';
    @Input() icon: string = '✅'; // Peut être remplacé par une icône SVG ou autre
    @Input() buttonText: string = 'OK';

    @Output() closeModal = new EventEmitter<void>();

    constructor() { }

    onClose(): void {
        this.closeModal.emit();
    }
} 