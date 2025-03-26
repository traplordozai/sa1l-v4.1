import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import CalendarView from "../components/shared/CalendarView"

describe("CalendarView", () => {
  it("renders 30 day boxes", () => {
    render(<CalendarView />)
    expect(screen.getAllByText(/\d+/).length).toBe(30)
  })
})

