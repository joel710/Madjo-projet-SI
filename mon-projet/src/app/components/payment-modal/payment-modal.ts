import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PaymentMethod {
    id: string;
    name: string;
    icon: string;
    description: string;
    color: string;
}

export interface PaymentData {
    method: string;
    amount: number;
    reservationId: number;
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    phoneNumber?: string;
}

@Component({
    selector: 'app-payment-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './payment-modal.html',
    styleUrls: ['./payment-modal.css']
})
export class PaymentModalComponent {
    @Input() isOpen: boolean = false;
    @Input() amount: number = 0;
    @Input() reservationId: number = 0;
    @Input() phoneNumber: string = '';
    @Output() closeModal = new EventEmitter<void>();
    @Output() paymentSubmitted = new EventEmitter<PaymentData>();

    selectedMethod: string = '';
    cardNumber: string = '';
    expiryDate: string = '';
    cvv: string = '';
    isLoading: boolean = false;

    paymentMethods: PaymentMethod[] = [
        {
            id: 'card',
            name: 'Carte Bancaire',
            icon: '💳',
            description: 'Visa, Mastercard, American Express',
            color: 'bg-gradient-to-r from-blue-500 to-purple-600'
        },
        {
            id: 'moov',
            name: 'Moov Money',
            icon: '📱',
            description: 'Paiement via Moov Money',
            color: 'bg-gradient-to-r from-orange-500 to-red-500'
        },
        {
            id: 'mixx',
            name: 'Mixx by Yas',
            icon: '💸',
            description: 'Paiement via Mixx by Yas',
            color: 'bg-gradient-to-r from-green-500 to-blue-400'
        }
    ];

    onClose(): void {
        this.closeModal.emit();
    }

    selectPaymentMethod(methodId: string): void {
        this.selectedMethod = methodId;
        if ((methodId === 'moov' || methodId === 'mixx') && this.phoneNumber) {
            this.phoneNumber = this.phoneNumber;
        }
    }

    formatCardNumber(event: any): void {
        let value = event.target.value.replace(/\s/g, '');
        value = value.replace(/\D/g, '');
        value = value.replace(/(\d{4})/g, '$1 ').trim();
        this.cardNumber = value.substring(0, 19);
    }

    formatExpiryDate(event: any): void {
        let value = event.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        this.expiryDate = value.substring(0, 5);
    }

    formatPhoneNumber(event: any): void {
        let value = event.target.value.replace(/\D/g, '');
        if (value.startsWith('228')) {
            value = value.substring(3);
        }
        if (value.length > 0) {
            value = '228' + value;
        }
        this.phoneNumber = value.substring(0, 11);
    }

    isFormValid(): boolean {
        if (!this.selectedMethod) return false;
        if (this.selectedMethod === 'card') {
            return this.cardNumber.replace(/\s/g, '').length === 16 &&
                this.expiryDate.length === 5 &&
                this.cvv.length >= 3;
        } else {
            return true; // Pour Moov et Mixx, pas de validation stricte
        }
    }

    onSubmit(): void {
        if (!this.isFormValid()) return;
        this.isLoading = true;
        const paymentData: PaymentData = {
            method: this.selectedMethod,
            amount: this.amount,
            reservationId: this.reservationId
        };
        if (this.selectedMethod === 'card') {
            paymentData.cardNumber = this.cardNumber.replace(/\s/g, '');
            paymentData.expiryDate = this.expiryDate;
            paymentData.cvv = this.cvv;
        }
        // Pour Moov et Mixx, pas de champs supplémentaires obligatoires
        setTimeout(() => {
            this.isLoading = false;
            this.paymentSubmitted.emit(paymentData);
        }, 1000);
    }

    getSelectedMethod(): PaymentMethod | undefined {
        return this.paymentMethods.find(method => method.id === this.selectedMethod);
    }
} 