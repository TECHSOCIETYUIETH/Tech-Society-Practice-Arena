// Test component to verify Tailwind classes are working
import React from 'react'

const TestComponents = () => {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-secondary-900">Component Test Page</h1>
      
      {/* Button Tests */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <button className="btn btn-primary btn-md">Primary Button</button>
          <button className="btn btn-secondary btn-md">Secondary Button</button>
          <button className="btn btn-success btn-md">Success Button</button>
          <button className="btn btn-warning btn-md">Warning Button</button>
          <button className="btn btn-danger btn-md">Danger Button</button>
          <button className="btn btn-outline btn-md">Outline Button</button>
          <button className="btn btn-ghost btn-md">Ghost Button</button>
        </div>
      </div>

      {/* Form Tests */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Form Elements</h2>
        <div className="max-w-md space-y-4">
          <div>
            <label className="form-label">Text Input</label>
            <input type="text" className="form-input" placeholder="Enter text..." />
          </div>
          
          <div>
            <label className="form-label">Select Dropdown</label>
            <select className="form-select">
              <option>Choose option...</option>
              <option>Option 1</option>
              <option>Option 2</option>
            </select>
          </div>
          
          <div>
            <label className="form-label">Textarea</label>
            <textarea className="form-textarea" rows="3" placeholder="Enter description..."></textarea>
          </div>
          
          <div className="flex items-center space-x-2">
            <input type="checkbox" className="form-checkbox" id="test-checkbox" />
            <label htmlFor="test-checkbox" className="text-sm">Check this box</label>
          </div>
        </div>
      </div>

      {/* Card Tests */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium">Card Title</h3>
            </div>
            <div className="card-body">
              <p className="text-secondary-600">This is card content with proper styling.</p>
            </div>
            <div className="card-footer">
              <button className="btn btn-primary btn-sm">Action</button>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-medium mb-2">Simple Card</h3>
              <p className="text-secondary-600">A card without header and footer.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Badge Tests */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Badges</h2>
        <div className="flex flex-wrap gap-2">
          <span className="badge badge-primary">Primary</span>
          <span className="badge badge-secondary">Secondary</span>
          <span className="badge badge-success">Success</span>
          <span className="badge badge-warning">Warning</span>
          <span className="badge badge-danger">Danger</span>
        </div>
      </div>

      {/* Color Test */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Color Palette</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Primary</h4>
            <div className="h-8 bg-primary-500 rounded"></div>
            <div className="h-8 bg-primary-600 rounded"></div>
            <div className="h-8 bg-primary-700 rounded"></div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Secondary</h4>
            <div className="h-8 bg-secondary-300 rounded"></div>
            <div className="h-8 bg-secondary-500 rounded"></div>
            <div className="h-8 bg-secondary-700 rounded"></div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Success</h4>
            <div className="h-8 bg-success-500 rounded"></div>
            <div className="h-8 bg-success-600 rounded"></div>
            <div className="h-8 bg-success-700 rounded"></div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Danger</h4>
            <div className="h-8 bg-danger-500 rounded"></div>
            <div className="h-8 bg-danger-600 rounded"></div>
            <div className="h-8 bg-danger-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestComponents