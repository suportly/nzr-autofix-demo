/**
 * BuggyComponent — Intentionally crashes during render.
 *
 * This component accesses a property on null, which throws a TypeError.
 * When wrapped in NzrErrorBoundary, the SDK captures the error and
 * shows the fallback UI instead of crashing the entire app.
 *
 * This demonstrates React Error Boundary integration.
 */
export default function BuggyComponent() {
  const data: any = null
  return <div>{data.property.that.does.not.exist}</div>
}
