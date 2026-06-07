package sse

import "sync"

// Broker fans out string messages to all connected SSE clients.
type Broker struct {
	mu      sync.RWMutex
	clients map[chan string]struct{}
}

func NewBroker() *Broker {
	return &Broker{
		clients: make(map[chan string]struct{}),
	}
}

func (b *Broker) Subscribe() chan string {
	ch := make(chan string, 32)
	b.mu.Lock()
	b.clients[ch] = struct{}{}
	b.mu.Unlock()
	return ch
}

func (b *Broker) Unsubscribe(ch chan string) {
	b.mu.Lock()
	delete(b.clients, ch)
	close(ch)
	b.mu.Unlock()
}

func (b *Broker) Publish(msg string) {
	b.mu.RLock()
	defer b.mu.RUnlock()
	for ch := range b.clients {
		select {
		case ch <- msg:
		default:
			// client too slow, drop the event
		}
	}
}
