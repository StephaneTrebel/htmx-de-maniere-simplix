package store

import (
	"sync"

	"traffic-dashboard/internal/model"
)

type RingBuffer struct {
	mu    sync.RWMutex
	items []*model.Event
	size  int
}

func NewRingBuffer(size int) *RingBuffer {
	return &RingBuffer{
		items: make([]*model.Event, 0, size),
		size:  size,
	}
}

func (rb *RingBuffer) Push(e *model.Event) {
	rb.mu.Lock()
	defer rb.mu.Unlock()
	rb.items = append(rb.items, e)
	if len(rb.items) > rb.size {
		rb.items = rb.items[len(rb.items)-rb.size:]
	}
}

// All returns events newest first.
func (rb *RingBuffer) All() []*model.Event {
	rb.mu.RLock()
	defer rb.mu.RUnlock()
	result := make([]*model.Event, len(rb.items))
	for i, j := 0, len(rb.items)-1; j >= 0; i, j = i+1, j-1 {
		result[i] = rb.items[j]
	}
	return result
}

func (rb *RingBuffer) GetByID(id string) *model.Event {
	rb.mu.RLock()
	defer rb.mu.RUnlock()
	for i := len(rb.items) - 1; i >= 0; i-- {
		if rb.items[i].ID == id {
			return rb.items[i]
		}
	}
	return nil
}

func (rb *RingBuffer) Clear() {
	rb.mu.Lock()
	defer rb.mu.Unlock()
	rb.items = rb.items[:0]
}
